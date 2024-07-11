import {
    Chapter,
    ChapterData,
    Content,
    ContentSource,
    DirectoryConfig,
    DirectoryFilter,
    DirectoryRequest,
    FilterType,
    Form,
    Highlight,
    ImageRequestHandler,
    NetworkClientBuilder,
    NetworkRequest,
    NetworkResponse,
    PagedResult,
    PageLink,
    PageLinkResolver,
    PageSection,
    Property,
    ResolvedPageSection,
    RunnerInfo,
    SectionStyle,
    Tag,
    UIToggle
} from '@suwatte/daisuke'

import { Parser } from './MadaraParser'
import { URLBuilder } from './MadaraHelper'
import { load } from 'cheerio'

const BASE_VERSION = 1.03
export const getExportVersion = (EXTENSION_VERSION: any): number => {
    return Number(BASE_VERSION + Number(EXTENSION_VERSION))
}

export abstract class Madara implements ContentSource, PageLinkResolver, ImageRequestHandler {

    abstract info: RunnerInfo

    /**
     *  Request manager override
     */
    requestsPerSecond = 5
    requestTimeout = 20000

    client: NetworkClient = new NetworkClientBuilder()
            .setRateLimit(this.requestsPerSecond, 1)
            .setTimeout(this.requestTimeout)
            .addRequestInterceptor(async (request) => {
                return {
                    ...request,
                    headers: {
                        ...(request.headers ?? {}),
                        ...{
                            'referer': `${this.baseUrl}/`,
                            'origin': `${this.baseUrl}/`,
                            ...(request.url.includes('wordpress.com') && { 'Accept': 'image/avif,image/webp,*/*' }) // Used for images hosted on Wordpress blogs
                        }
                    },
                    cookies: [
                        { name: "wpmanga-adault", domain: this.baseUrl, value: "1" },
                        { name: "toonily-mature", domain: this.baseUrl, value: "1" },
                    ],
                }
            })
            .build()

    async getPreferenceMenu(): Promise<Form> {
        return {
            sections: [
                {
                    footer: 'Enabling HQ thumbnails will use more bandwidth and will load thumbnails slightly slower.',
                    children: [
                        UIToggle({
                            id: 'hq_thumb',
                            title: 'HQ Thumbnails',
                            value: await ObjectStore.boolean("HQthumb") ?? true,
                            async didChange(value) {
                                return ObjectStore.set('HQthumb', value)
                            }
                        })
                    ]
                }
            ]
        }
    }

    /**
    * The Madara URL of the website. Eg. https://webtoon.xyz
    */
    abstract baseUrl: string

    /**
     * The language code the source's content is served in in string form.
     */
    language = 'en_GB'

    /**
     * Different Madara sources might have a slightly different selector which is required to parse out
     * each manga object while on a search result page. This is the selector
     * which is looped over. This may be overridden if required.
     */
    searchMangaSelector = 'div.c-tabs-item__content'

    /**
     * Set to true if your source has advanced search functionality built in.
     * If this is not true, no genre tags will be shown on the homepage!
     * See https://www.webtoon.xyz/?s=&post_type=wp-manga if they have a "advanced" option, if NOT, set this to false.
     */
    hasAdvancedSearchPage = true

    /**
     * The path used for search pagination. Used in search function.
     * Eg. for https://mangabob.com/page/2/?s&post_type=wp-manga it would be 'page'
     */
    searchPagePathName = 'page'

    /**
     * Set to true if the source makes use of the manga chapter protector plugin.
     * (https://mangabooth.com/product/wp-manga-chapter-protector/)
     */
    hasProtectedChapters = false

    /**
     * Some sources may in the future change how to get the chapter protector data,
     * making it configurable, will make it way more flexible and open to customized installations of the protector plugin.
     */
    protectedChapterDataSelector = '#chapter-protector-data'

    /**
     * Some sites use the alternate URL for getting chapters through ajax
     * 0: (POST) Form data https://domain.com/wp-admin/admin-ajax.php
     * 1: (POST) Alternative Ajax page (https://domain.com/manga/manga-slug/ajax/chapters)
     * 2: (POST) Manga page (https://domain.com/manga/manga-slug)
     */
    chapterEndpoint = 0

    /**
     * Different Madara sources might have a slightly different selector which is required to parse out
     * each page while on a chapter page. This is the selector
     * which is looped over. This may be overridden if required.
     */
    chapterDetailsSelector = 'div.page-break > img'

    /**
     * Some websites have the Cloudflare defense check enabled on specific parts of the website, these need to be loaded when using the Cloudflare bypass within the app
     */
    bypassPage = ''

    /**
     * If it's not possible to use postIds for certain reasons, you can disable this here.
     */
    usePostIds = true

    /**
     * When not using postIds, you need to set the directory path
     */
    directoryPath = 'manga'

    /**
     * Some sources may redirect to the manga page instead of the chapter page if adding the parameter '?style=list'
     */
    useListParameter = true

    parser = new Parser()

    async getContent(mangaId: string): Promise<Content> {
        const response = await this.client.get(this.usePostIds ? `${this.baseUrl}/?p=${mangaId}/` : `${this.baseUrl}/${this.directoryPath}/${mangaId}/`)
        this.checkResponseError(response)
        const $ = load(response.data as string)

        return this.parser.parseMangaDetails($, mangaId, this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        let requestConfig: NetworkRequest
        let path = this.directoryPath
        let slug = mangaId

        if (this.usePostIds) {
            const postData = await this.convertPostIdToSlug(Number(mangaId))
            path = postData.path
            slug = postData.slug
        }

        switch (this.chapterEndpoint) {
            case 0:
                requestConfig = {
                    url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    body: {
                        'action': 'manga_get_chapters',
                        'manga': this.usePostIds ? mangaId : await this.convertSlugToPostId(mangaId, this.directoryPath)
                    }
                }
                break

            case 1:
                requestConfig = {
                    url: `${this.baseUrl}/${path}/${slug}/ajax/chapters`,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                }
                break

            case 2:
                requestConfig = {
                    url: `${this.baseUrl}/${path}/${slug}`,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                }
                break

            default:
                throw new Error('Invalid chapter endpoint!')
        }

        const response = await this.client.request(requestConfig)
        this.checkResponseError(response)
        const $ = load(response.data as string)

        return this.parser.parseChapterList($, mangaId, this)
    }

    async getChapterData(mangaId: string, chapterId: string): Promise<ChapterData> {

        let url: string
        if (this.usePostIds) {
            const slugData: any = await this.convertPostIdToSlug(Number(mangaId))
            url = `${this.baseUrl}/${slugData.path}/${slugData.slug}/${chapterId}/${this.useListParameter ? '?style=list' : ''}`
        } else {
            url = `${this.baseUrl}/${this.directoryPath}/${mangaId}/${chapterId}/${this.useListParameter ? '?style=list' : ''}`
        }

        const request = {
            url: url,
            method: 'GET'
        }

        const response = await this.client.request(request)
        this.checkResponseError(response)
        const $ = load(response.data as string)

        if (this.hasProtectedChapters) {
            return this.parser.parseProtectedChapterDetails($, mangaId, chapterId, this.protectedChapterDataSelector, this)
        }

        return this.parser.parseChapterDetails($, mangaId, chapterId, this.chapterDetailsSelector, this)
    }

    async getFilters(): Promise<DirectoryFilter[]> {
        const genres: DirectoryFilter = {
            id: "genres",
            title: "Genres",
            type: FilterType.MULTISELECT,
            options: (await this.getGenreTags()),
        };

        return [genres];
    }

    async getGenreTags(): Promise<Tag[]> {
        const response = await this.client.get(this.hasAdvancedSearchPage ? `${this.baseUrl}/?s=the&post_type=wp-manga` : `${this.baseUrl}/`)
        this.checkResponseError(response)
        const $ = load(response.data as string)

        return this.parser.parseTags($, this.hasAdvancedSearchPage)
    }

    async getTags(): Promise<Property[]> {
        return [
            {
                id: "genres",
                title: "Genres",
                tags: await this.getGenreTags()
            }
        ]
    }

    async getDirectory(searchRequest: DirectoryRequest): Promise<PagedResult> {
        if (searchRequest.listId) {
            return this.getViewMoreItems(searchRequest)
        }

        // If we're supplied a page that we should be on, set our internal reference to that page. Otherwise, we start from page 0.
        const page = searchRequest?.page ?? 1

        const request = this.constructSearchRequest(page, searchRequest)
        const response = await this.client.request(request)
        this.checkResponseError(response)
        const $ = load(response.data as string)
        const results = await this.parser.parseSearchResults($, this)

        const manga: Highlight[] = []
        for (const result of results) {
            if (this.usePostIds) {
                const postId = await this.slugToPostId(result.slug, result.path)

                manga.push({
                    id: String(postId),
                    cover: result.image,
                    title: result.title,
                    subtitle: result.subtitle
                })
            } else {
                manga.push({
                    id: result.slug,
                    cover: result.image,
                    title: result.title,
                    subtitle: result.subtitle
                })
            }
        }

        return {
            results: manga,
            isLastPage: false
        }
    }

    async getDirectoryConfig(configID?: string | undefined): Promise<DirectoryConfig> {
        return {
            filters: await this.getFilters()
        }
    }

    async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
        if (link.id !== "home")
            throw new Error("Accessing invalid page")

        const sections: { request: any, section: PageSection }[] = [
            {
                request: this.constructAjaxHomepageRequest(0, 10, '_latest_update'),
                section: {
                    id: '0',
                    title: 'Recently Updated',
                    style: SectionStyle.DEFAULT,
                    viewMoreLink: { request: { page: 1, listId: "0" } }
                }
            },
            {
                request: this.constructAjaxHomepageRequest(0, 10, '_wp_manga_week_views_value'),
                section: {
                    id: '1',
                    title: 'Currently Trending',
                    style: SectionStyle.DEFAULT,
                    viewMoreLink: { request: { page: 1, listId: "1" } }
                }
            },
            {
                request: this.constructAjaxHomepageRequest(0, 10, '_wp_manga_views'),
                section: {
                    id: '2',
                    title: 'Most Popular',
                    style: SectionStyle.DEFAULT,
                    viewMoreLink: { request: { page: 1, listId: "2" } }
                }
            },
            {
                request: this.constructAjaxHomepageRequest(0, 10, '_wp_manga_status', 'end'),
                section: {
                    id: '3',
                    title: 'Completed',
                    style: SectionStyle.DEFAULT,
                    viewMoreLink: { request: { page: 1, listId: "3" } }
                }
            }
        ]

        const promises: Promise<PageSection>[] = []
        for (const section of sections) {
            // Get the section data
            promises.push(
                this.client.request(section.request).then(async response => {
                    this.checkResponseError(response)
                    const $ = load(response.data as string)
                    section.section.items = await this.parser.parseHomeSection($, this)
                    return section.section
                })
            )

        }

        // Make sure the function completes
        const results = await Promise.allSettled(promises);
        return results
            .filter((x): x is PromiseFulfilledResult<PageSection> => x.status === "fulfilled")
            .map(x => x.value)
    }

    resolvePageSection(link: PageLink, sectionID: string): Promise<ResolvedPageSection> {
        throw new Error('Method not needed.')
    }

    async getViewMoreItems(searchRequest: DirectoryRequest): Promise<PagedResult> {
        const page = searchRequest?.page ?? 0
        let sortBy: any[] = []

        switch (searchRequest.listId) {
            case '0': {
                sortBy = ['_latest_update']
                break
            }
            case '1': {
                sortBy = ['_wp_manga_week_views_value']
                break
            }
            case '2': {
                sortBy = ['_wp_manga_views']
                break
            }
            case '3': {
                sortBy = ['_wp_manga_status', 'end']
                break
            }
        }

        const request = this.constructAjaxHomepageRequest(page, 50, sortBy[0], sortBy[1])
        const response = await this.client.request(request)
        this.checkResponseError(response)
        const $ = load(response.data as string)
        const items: Highlight[] = await this.parser.parseHomeSection($, this)

        return {
            results: items,
            totalResultCount: items.length,
            isLastPage: items.length < 50
        }
    }

    // Utility
    constructSearchRequest(page: number, request: DirectoryRequest): any {
        const genres = request.filters?.genres ?? [];
        genres.push(request.tag?.tagId)

        return {
            url: new URLBuilder(this.baseUrl)
                .addPathComponent(this.searchPagePathName)
                .addPathComponent(page.toString())
                .addQueryParameter('s', encodeURIComponent(request?.query ?? ''))
                .addQueryParameter('post_type', 'wp-manga')
                .addQueryParameter('genre', genres?.map((x: string) => x))
                .buildUrl({ addTrailingSlash: true, includeUndefinedParameters: false }),
            method: 'GET'
        }
    }

    constructAjaxHomepageRequest(page: number, postsPerPage: number, meta_key: string, meta_value?: string): any {
        return {
            url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: {
                'action': 'madara_load_more',
                'template': 'madara-core/content/content-archive',
                'page': page,
                'vars[paged]': '1',
                'vars[posts_per_page]': postsPerPage,
                'vars[orderby]': 'meta_value_num',
                'vars[sidebar]': 'right',
                'vars[post_type]': 'wp-manga',
                'vars[order]': 'desc',
                'vars[meta_key]': meta_key,
                'vars[meta_value]': meta_value
            }
        }
    }

    async slugToPostId(slug: string, path: string): Promise<string> {
        if (await ObjectStore.string(slug) == null) {
            const postId = await this.convertSlugToPostId(slug, path)

            const existingMappedSlug = await ObjectStore.string(postId)
            if (existingMappedSlug != null) {
                await ObjectStore.set(slug, undefined)
            }

            await ObjectStore.set(postId, slug)
            await ObjectStore.set(slug, postId)
        }

        const postId = await ObjectStore.string(slug)
        if (!postId) throw new Error(`Unable to fetch postId for slug:${slug}`)

        return postId
    }

    async convertPostIdToSlug(postId: number) {
        const request = {
            url: `${this.baseUrl}/?p=${postId}`,
            method: 'GET'
        }

        const response = await this.client.request(request)
        const $ = load(response.data as string)

        let parseSlug: any
        // Step 1: Try to get slug from og-url
        parseSlug = String($('meta[property="og:url"]').attr('content'))

        // Step 2: Try to get slug from canonical
        if (!parseSlug.includes(this.baseUrl)) {
            parseSlug = String($('link[rel="canonical"]').attr('href'))
        }

        if (!parseSlug || !parseSlug.includes(this.baseUrl)) {
            throw new Error('Unable to parse slug!')
        }

        parseSlug = parseSlug
            .replace(/\/$/, '')
            .split('/')

        const slug = parseSlug.slice(-1).pop()
        const path = parseSlug.slice(-2).shift()

        return { path, slug }
    }

    async convertSlugToPostId(slug: string, path: string): Promise<string> { // Credit to the MadaraDex team :-D
        const headRequest = {
            url: `${this.baseUrl}/${path}/${slug}`,
            method: 'HEAD'
        }
        const headResponse = await this.client.request(headRequest)

        let postId: any

        const postIdRegex = headResponse?.headers['Link']?.match(/\?p=(\d+)/)
        if (postIdRegex && postIdRegex[1]) postId = postIdRegex[1]
        if (postId || !isNaN(Number(postId))) {
            return postId?.toString()
        } else {
            postId = ''
        }

        const request = {
            url: `${this.baseUrl}/${path}/${slug}`,
            method: 'GET'
        }

        const response = await this.client.request(request)
        const $ = load(response.data as string)

        // Step 1: Try to get postId from shortlink
        postId = Number($('link[rel="shortlink"]')?.attr('href')?.split('/?p=')[1])

        // Step 2: If no number has been found, try to parse from data-post
        if (isNaN(postId)) {
            postId = Number($('a.wp-manga-action-button').attr('data-post'))
        }

        // Step 3: If no number has been found, try to parse from manga script
        if (isNaN(postId)) {
            const page = $.root().html()
            const match = page?.match(/manga_id.*\D(\d+)/)
            if (match && match[1]) {
                postId = Number(match[1]?.trim())
            }
        }

        if (!postId || isNaN(postId)) {
            throw new Error(`Unable to fetch numeric postId for this item! (path:${path} slug:${slug})`)
        }

        return postId.toString()
    }

    checkResponseError(response: NetworkResponse): void {
        const status = response.status
        switch (status) {
            case 403:
            case 503:
                throw new CloudflareError(response.request.url)
            case 404:
                throw new Error(`The requested page ${response.request.url} was not found!`)
        }
    }

    async willRequestImage(url: string): Promise<NetworkRequest> {
        return {
            url,
            headers: {
                'referer': `${this.baseUrl}/`,
                'origin': `${this.baseUrl}/`,
                ...(url.includes('wordpress.com') && { 'Accept': 'image/avif,image/webp,*/*' }) // Used for images hosted on Wordpress blogs
            }
        }
    }
}