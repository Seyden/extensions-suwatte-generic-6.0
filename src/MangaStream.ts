/* eslint-disable linebreak-style */
import {
    Chapter,
    ChapterData,
    Content,
    ContentSource,
    DirectoryConfig,
    DirectoryFilter,
    DirectoryRequest,
    ExcludableMultiSelectProp,
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
} from '@suwatte/daisuke'

import { MangaStreamParser } from './MangaStreamParser'
import { URLBuilder } from './UrlBuilder'
import {
    createHomeSection,
    DefaultHomeSectionData,
    getFilterTagsBySection,
    getSelectValue,
    HomeSectionData,
} from './MangaStreamHelper'

import {
    FilterProps,
    Months,
    StatusTypes
} from './MangaStreamInterfaces'

import { load } from 'cheerio'
import { UITextField } from '@suwatte/daisuke/dist/types/UI/UIElementBuilders'

const simpleUrl = require('simple-url')

// Set the version for the base, changing this version will change the versions of all sources
const BASE_VERSION = 1.0
export const getExportVersion = (EXTENSION_VERSION: string): number => {
    return Number(BASE_VERSION.toString().split('.')
                       .map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index]))
                       .join('.'))
}

export abstract class MangaStream implements ContentSource, PageLinkResolver, ImageRequestHandler {
    constructor() {
        this.configureSections()
    }

    abstract info: RunnerInfo

    async getPreferenceMenu(): Promise<Form> {
        return {
            sections: [
                {
                    footer: 'Override the domain url for the source.',
                    children: [
                        UITextField({
                            id: 'domain',
                            title: 'Domain',
                            value: await this.getAndSetBaseUrl(),
                            async didChange(value) {
                                return ObjectStore.set('Domain', value)
                            }
                        })
                    ]
                }
            ]
        }
    }

    parser = new MangaStreamParser()

    // ----REQUEST MANAGER----

    client: NetworkClient = new NetworkClientBuilder()
        .setRateLimit(15, 1)
        .setTimeout(30000)
        .addRequestInterceptor(async (request) => {
            const url: string = await this.getAndSetBaseUrl()
            request.headers = {
                ...(request.headers ?? {}),
                ...{
                    referer: `${url}/`,
                    ...((request.url.includes('wordpress.com') || request.url.includes('wp.com')) && {
                        Accept: 'image/avif,image/webp,*/*'
                    }) // Used for images hosted on Wordpress blogs
                }
            }

            const path: any = simpleUrl.parse(request.url, true)
            if (!path.protocol || path.protocol == 'http') {
                path.protocol = 'https'
                request.url = simpleUrl.create(path)
            }

            await this.interceptRequest(request)

            /*if (isImgLink(request.url)) {
                let overrideUrl: string = await ObjectStore.string('Domain')
                if (overrideUrl && overrideUrl != this.baseUrl) {
                    const basePath: any = simpleUrl.parse(this.baseUrl, true)
                    const overridePath: any = simpleUrl.parse(overrideUrl, true)
                    if (path.host.includes(basePath.host) || path.host.includes(overridePath.host)) {
                        path.host = overridePath.host
                        request.url = simpleUrl.create(path)
                    }
                }
            }*/

            return request
        })
        .addResponseInterceptor(async (response) => {
            await this.interceptResponse(response)
            if (response.headers.location) {
                response.headers.location = response.headers.location.replace(/^http:/, 'https:')
            }
            return response
        })
        .build()

    async interceptResponse(response: NetworkResponse): Promise<void> {
    }

    async interceptRequest(request: NetworkRequest): Promise<void> {
    }

    /**
     * The URL of the website. Eg. https://mangadark.com without a trailing slash
     */
    finalUrl: string = ''
    abstract baseUrl: string
    async getAndSetBaseUrl(): Promise<string> {
        let url: string = await ObjectStore.string('Domain') ?? this.baseUrl
        this.finalUrl = url
        return url
    }

    /**
     * The language code which this source supports.
     */
    language: string = '🇬🇧'

    // ----GENERAL SELECTORS----

    /**
     * The pathname between the domain and the manga.
     * Eg. https://mangadark.com/manga/mashle-magic-and-muscles the pathname would be "manga"
     * Default = "manga"
     */
    sourceTraversalPathName = 'manga'

    /**
     * Fallback image if no image is present
     * Default = "https://i.imgur.com/GYUxEX8.png"
     */
    fallbackImage = 'https://i.imgur.com/GYUxEX8.png'

    /**
     * Some websites have the Cloudflare defense check enabled on specific parts of the website, these need to be loaded when using the Cloudflare bypass within the app
     */
    bypassPage = ''

    /**
     * If it's not possible to use postIds for certain reasons, you can disable this here.
     */
    usePostIds = true

    /**
     * If the source supports tag exclusion
     */
    supportsTagExclusion = false

    // ----MANGA DETAILS SELECTORS----
    /**
     * The selector for alternative titles.
     * This can change depending on the language
     * Leave default if not used!
     * Default = "b:contains(Alternative Titles)"
     */
    manga_selector_AlternativeTitles = 'Alternative Titles'
    /**
     * The selector for authors.
     * This can change depending on the language
     * Leave default if not used!
     * Default = "Author" (English)
     */
    manga_selector_author = 'Author'
    /**
     * The selector for artists.
     * This can change depending on the language
     * Leave default if not used!
     * Default = "Artist" (English)
     */
    manga_selector_artist = 'Artist'

    /**
     * The selector for status.
     * This can change depending on the language
     * Leave default if not used!
     * Default = "Status" (English)
     * THESE ARE CASE SENSITIVE!
     */
    manga_selector_status = 'Status'

    manga_tag_selector_box = 'span.mgen'

    /**
     * The selector for the manga status.
     * These can change depending on the language
     * Default = ONGOING: "ONGOING", COMPLETED: "COMPLETED"
     */
    manga_StatusTypes: StatusTypes = {
        ONGOING: 'ONGOING',
        COMPLETED: 'COMPLETED',
        DROPPED: 'DROPPED'
    }

    // ----DATE SELECTORS----
    /**
     * Enter the months for the website's language in correct order, case insensitive.
     * Default = English Translation
     */
    dateMonths: Months = {
        january: 'January',
        february: 'February',
        march: 'March',
        april: 'April',
        may: 'May',
        june: 'June',
        july: 'July',
        august: 'August',
        september: 'September',
        october: 'October',
        november: 'November',
        december: 'December'
    }

    // ----HOMESCREEN SELECTORS----
    /**
     * Enable or disable the "Popular Today" section on the homescreen
     * Some sites don't have this section on this homescreen, if they don't disable this.
     * Enabled Default = true
     * Selector Default = "h2:contains(Popular Today)"
     */

    configureSections(): void {
    }

    sections: Record<'popular_today' | 'latest_update' | 'new_titles' | 'top_alltime' | 'top_monthly' | 'top_weekly', HomeSectionData> = {
        'popular_today': {
            ...DefaultHomeSectionData,
            section: createHomeSection('popular_today', 'Popular Today', true, SectionStyle.GALLERY),
            selectorFunc: ($: CheerioStatic) => $('div.bsx', $('h2:contains(Popular Today)')?.parent()?.next()),
            titleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('a', element).attr('title'),
            subtitleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('div.epxs', element).text().trim(),
            getViewMoreItemsFunc: (page: string) => `${this.sourceTraversalPathName}/?page=${page}&order=popular`,
            sortIndex: 10
        },
        'latest_update': {
            ...DefaultHomeSectionData,
            section: createHomeSection('latest_update', 'Latest Updates'),
            selectorFunc: ($: CheerioStatic) => $('div.uta', $('h2:contains(Latest Update)')?.parent()?.next()),
            titleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('a', element).attr('title'),
            subtitleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('li > span', $('div.luf', element)).first().text().trim(),
            getViewMoreItemsFunc: (page: string) => `${this.sourceTraversalPathName}/?page=${page}&order=update`,
            sortIndex: 20
        },
        'new_titles': {
            ...DefaultHomeSectionData,
            section: createHomeSection('new_titles', 'New Titles'),
            selectorFunc: ($: CheerioStatic) => $('li', $('h3:contains(New Series)')?.parent()?.next()),
            subtitleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('span a', element).toArray().map(x => $(x).text().trim()).join(', '),
            getViewMoreItemsFunc: (page: string) => `${this.sourceTraversalPathName}/?page=${page}&order=latest`,
            sortIndex: 30
        },
        'top_alltime': {
            ...DefaultHomeSectionData,
            section: createHomeSection('top_alltime', 'Top All Time', false),
            selectorFunc: ($: CheerioStatic) => $('li', $('div.serieslist.pop.wpop.wpop-alltime')),
            subtitleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('span a', element).toArray().map(x => $(x).text().trim()).join(', '),
            sortIndex: 40
        },
        'top_monthly': {
            ...DefaultHomeSectionData,
            section: createHomeSection('top_monthly', 'Top Monthly', false),
            selectorFunc: ($: CheerioStatic) => $('li', $('div.serieslist.pop.wpop.wpop-monthly')),
            subtitleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('span a', element).toArray().map(x => $(x).text().trim()).join(', '),
            sortIndex: 50
        },
        'top_weekly': {
            ...DefaultHomeSectionData,
            section: createHomeSection('top_weekly', 'Top Weekly', false),
            selectorFunc: ($: CheerioStatic) => $('li', $('div.serieslist.pop.wpop.wpop-weekly')),
            subtitleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('span a', element).toArray().map(x => $(x).text().trim()).join(', '),
            sortIndex: 60
        }
    }

    getMangaShareUrl(mangaId: string): string {
        return this.usePostIds
               ? `${this.finalUrl}/${this.sourceTraversalPathName}/?p=${mangaId}/`
               : `${this.finalUrl}/${this.sourceTraversalPathName}/${mangaId}/`
    }

    getMangaData = async (mangaId: string): Promise<CheerioStatic> => await this.loadRequestData(this.getMangaShareUrl(mangaId))

    async getContent(mangaId: string): Promise<Content> {
        await this.getAndSetBaseUrl()
        const $ = await this.getMangaData(mangaId)
        return await this.parser.parseMangaDetails($, mangaId, this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const $ = await this.getMangaData(mangaId)
        const chapters = await this.parser.parseChapterList($, mangaId, this)
        if (!Array.isArray(chapters) || chapters.length == 0) {
            throw new Error(`Couldn't find any chapters for mangaId ${mangaId}, throwing an error to prevent loosing reading progress`)
        }

        return chapters
    }

    async getChapterSlug(mangaId: string, chapterId: string): Promise<string> {
        const chapterKey = `${mangaId}:${chapterId}`
        let existingMappedChapterLink = await ObjectStore.string(chapterKey)
        // If the Chapter List wasn't retrieved since the app was opened, retrieve it first and initialize it for all chapters
        if (existingMappedChapterLink == null) {
            await this.getChapters(mangaId)
        }

        existingMappedChapterLink = await ObjectStore.string(chapterKey)
        if (existingMappedChapterLink == null) {
            throw new Error(`Could not parse out Chapter Link when getting chapter details for postId: ${mangaId} chapterId: ${chapterId}`)
        }

        return existingMappedChapterLink
    }

    async getChapterData(mangaId: string, chapterId: string): Promise<ChapterData> {
        const chapterLink: string = await this.getChapterSlug(mangaId, chapterId)
        const url: string = await this.getAndSetBaseUrl()
        const $ = await this.loadRequestData(`${url}/${chapterLink}/`)
        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    async getFilters(): Promise<DirectoryFilter[]> {
        const url: string = await this.getAndSetBaseUrl()
        const $ = await this.loadRequestData(`${url}/${this.sourceTraversalPathName}`)

        return this.parser.parseTags($, this.supportsTagExclusion).map(x => {
            return {
                id: x.id,
                title: x.title,
                type: x.type,
                options: x.tags
            }
        })
    }

    async getTags(): Promise<Property[]> {
        const url: string = await this.getAndSetBaseUrl()
        const $ = await this.loadRequestData(`${url}/${this.sourceTraversalPathName}`)

        return [
            {
                id: "genres",
                title: "Genres",
                tags: this.parser.parseTags($, this.supportsTagExclusion).find(x => x.id == "genres")?.tags!
            }
        ]
    }

    async getDirectory(searchRequest: DirectoryRequest<FilterProps>): Promise<PagedResult> {
        if (searchRequest.listId) {
            return this.getViewMoreItems(searchRequest)
        }

        let result: {
            isLastPage: boolean;
            manga: Highlight[]
        }
        let manga: Highlight[] = []
        let isLastPage = false

        while (manga.length == 0)
        {
            result = await this.search(searchRequest)
            isLastPage = result.isLastPage
            manga = result.manga
        }

        return {
            results: manga,
            isLastPage
        }
    }

    async getDirectoryConfig(configID?: string | undefined): Promise<DirectoryConfig> {
        if (configID) {
            return { searchable: false }
        }

        return {
            filters: await this.getFilters(),
        }
    }

    private async search(query: DirectoryRequest<FilterProps>): Promise<{isLastPage: boolean, manga: Highlight[]}> {
        const page: number = query?.page ?? 1

        const request = await this.constructSearchRequest(page, query)
        const response = await this.client.request(request)
        this.checkResponseErrors(response)
        const $ = load(response.data as string)
        const results = await this.parser.parseSearchResults($, this)

        //const includedTags = this.supportsTagExclusion() ? query.filters as ExcludableMultiSelectProp;
        const chapterTag =  query?.filters?.chapters

        const manga: Highlight[] = []
        for (const result of results) {
            if (chapterTag) {
                const chapterCount = parseInt(chapterTag)
                const chapterCountRegex = result.subtitle?.match(/(\d+)/)
                if (chapterCountRegex?.[1] && parseInt(chapterCountRegex[1]) < chapterCount)
                    continue
            }

            let mangaId: string = result.slug
            if (this.usePostIds) {
                mangaId = await this.slugToPostId(result.slug, result.path)
            }

            manga.push({
                id: mangaId,
                cover: result.image,
                title: result.title,
                subtitle: result.subtitle
            })
        }

        return {
            isLastPage: this.parser.isLastPage($, query?.query ? 'search_request' : 'view_more'),
            manga
        }
    }

    async constructSearchRequest(page: number, query: DirectoryRequest<FilterProps>): Promise<any> {
        const url: string = await this.getAndSetBaseUrl()
        let urlBuilder: URLBuilder = new URLBuilder(url)
            .addPathComponent(this.sourceTraversalPathName)
            .addQueryParameter('page', page.toString())

        if (query?.query) {
            urlBuilder = urlBuilder.addQueryParameter('s', encodeURIComponent(query?.query.replace(/[’–][a-z]*/g, '') ?? ''))
        } else {
            const excludedGenres = query.filters?.genres as ExcludableMultiSelectProp

            urlBuilder = urlBuilder
                .addQueryParameter('genre', !this.supportsTagExclusion ? query.filters?.genres : undefined)
                .addQueryParameter('genre', getFilterTagsBySection(excludedGenres?.idincluded, true, this.supportsTagExclusion))
                .addQueryParameter('genre', getFilterTagsBySection(excludedGenres?.excluded, false, this.supportsTagExclusion))
                .addQueryParameter('status', getSelectValue(query?.filters?.status))
                .addQueryParameter('type', getSelectValue(query?.filters?.type))
                .addQueryParameter('order', getSelectValue(query?.filters?.order))
        }

        return {
            url: urlBuilder.buildUrl({
                addTrailingSlash: true,
                includeUndefinedParameters: false
            }),
            method: 'GET'
        }
    }

    async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
        if (link.id !== "home")
            throw new Error("Accessing invalid page")

        const url: string = await this.getAndSetBaseUrl()
        const $ = await this.loadRequestData(`${url}/`)

        const promises: Promise<PageSection>[] = []
        const sectionValues = Object.values(this.sections).sort((n1, n2) => n1.sortIndex - n2.sortIndex)

        for (const section of sectionValues) {
            if (!section.enabled) {
                continue
            }

            promises.push((async () => {
                section.section.items = await this.parser.parseHomeSection($, section, this)
                return section.section
            })())
        }

        // Make sure the function completes
        const results = await Promise.allSettled(promises);
        return results
            .filter((x): x is PromiseFulfilledResult<PageSection> => x.status === "fulfilled")
            .map(x => x.value)
    }

    async getViewMoreItems(searchRequest: DirectoryRequest): Promise<PagedResult> {
        const page: number = searchRequest?.page ?? 1

        // @ts-ignore
        const param = this.sections[searchRequest.listId].getViewMoreItemsFunc(page) ?? undefined
        if (!param) {
            throw new Error(`Invalid homeSectionId | ${searchRequest.listId}`)
        }

        const url: string = await this.getAndSetBaseUrl()
        const $ = await this.loadRequestData(`${url}/${param}`)

        const items: Highlight[] = await this.parser.parseViewMore($, this)

        return {
            results: items,
            isLastPage: this.parser.isLastPage($, 'view_more')
        }
    }

    async slugToPostId(slug: string, path: string): Promise<string> {
        if ((await ObjectStore.string(slug)) == null) {
            const postId = await this.convertSlugToPostId(slug, path)

            await ObjectStore.set(postId, slug)
            await ObjectStore.set(slug, postId)
        }

        const postId = await ObjectStore.string(slug)
        if (!postId) {
            throw new Error(`Unable to fetch postId for slug:${slug}`)
        }

        return postId
    }

    async convertPostIdToSlug(postId: number): Promise<any> {
        const url: string = await this.getAndSetBaseUrl()
        const $ = await this.loadRequestData(`${url}/?p=${postId}`)

        let parseSlug: any
        // Step 1: Try to get slug from og-url
        parseSlug = String($('meta[property="og:url"]').attr('content'))

        // Step 2: Try to get slug from canonical
        if (!parseSlug.includes(url)) {
            parseSlug = String($('link[rel="canonical"]').attr('href'))
        }

        if (!parseSlug || !parseSlug.includes(url)) {
            throw new Error('Unable to parse slug!')
        }

        parseSlug = parseSlug.replace(/\/$/, '').split('/')

        const slug = parseSlug.slice(-1).pop()
        const path = parseSlug.slice(-2).shift()

        return {
            path,
            slug
        }
    }

    async convertSlugToPostId(slug: string, path: string): Promise<string> {
        const url: string = await this.getAndSetBaseUrl()
        const request = {
            url: `${url}/${path}/${slug}/`,
            method: 'GET',
        }

        const response = await this.client.request(request)
        this.checkResponseErrors(response)

        let postId: any

        const postIdRegex = response?.headers.Link?.match(/\?p=(\d+)/)
        if (postIdRegex?.[1]) {
            postId = postIdRegex[1]
        }

        if (postId || !isNaN(Number(postId))) {
            return postId?.toString()
        }

        const $ = load(response.data as string)

        // Step 1: Try to get postId from shortlink
        postId = Number($('link[rel="shortlink"]')?.attr('href')?.split('/?p=')[1])

        // Step 2: If no number has been found, try to parse from data-id
        if (isNaN(postId)) {
            postId = Number($('div.bookmark').attr('data-id'))
        }

        // Step 3: If no number has been found, try to parse from manga script
        if (isNaN(postId)) {
            const page = $.root().html()
            const match = page?.match(/postID.*\D(\d+)/)
            if (match != null && match[1]) {
                postId = Number(match[1]?.trim())
            }
        }

        if (!postId || isNaN(postId)) {
            throw new Error(`Unable to fetch numeric postId for this item! (path:${path} slug:${slug})`)
        }

        return postId.toString()
    }

    async loadRequestData(url: string, method: string = 'GET'): Promise<CheerioStatic> {
        const request = {
            url,
            method
        }

        const response = await this.client.request(request)
        this.checkResponseErrors(response)
        return load(response.data as string)
    }

    /*async getCloudflareBypassRequestAsync(): Promise<Request> {
        const url: string = await this.getAndSetBaseUrl()
        return {
            url: `${this.bypassPage || url}/`,
            method: 'GET',
            headers: {
                referer: `${url}/`,
                origin: `${url}/`,
            }
        }
    }*/

    checkResponseErrors(response: NetworkResponse): void {
        const status = response.status
        switch (status) {
            case 403:
            case 503:
                throw new Error(`CLOUDFLARE BYPASS ERROR:\\nPlease go to the homepage of <${this.baseUrl}> and press the cloud icon.`)
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

    resolvePageSection(link: PageLink, sectionID: string): Promise<ResolvedPageSection> {
        throw new Error('Method not needed.')
    }
}