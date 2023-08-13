/* eslint-disable linebreak-style */
import {
    Chapter,
    ChapterDetails,
    ChapterProviding,
    HomePageSectionsProviding,
    HomeSection,
    HomeSectionType,
    MangaProviding,
    PagedResults,
    PartialSourceManga,
    Request,
    Response,
    SearchRequest,
    SearchResultsProviding,
    SourceManga,
    TagSection
} from '@paperback/types'

import { MangaStreamParser } from './MangaStreamParser'
import { URLBuilder } from './UrlBuilder'
import {
    createHomeSection,
    DefaultHomeSectionData,
    getFilterTagsBySection,
    getIncludedTagBySection,
    HomeSectionData,
    isImgLink
} from './MangaStreamHelper'

import {
    Months,
    StatusTypes
} from './MangaStreamInterfaces'

import {
    DUINavigationButton,
    DUISection,
    SourceStateManager
} from '@paperback/types/lib'

const simpleUrl = require('simple-url')

// Set the version for the base, changing this version will change the versions of all sources
const BASE_VERSION = '3.0.3'
export const getExportVersion = (EXTENSION_VERSION: string): string => {
    return BASE_VERSION.split('.')
                       .map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index]))
                       .join('.')
}

export abstract class MangaStream implements ChapterProviding, HomePageSectionsProviding, MangaProviding, SearchResultsProviding {
    constructor(public cheerio: CheerioAPI) {
        this.configureSections()
    }

    stateManager = App.createSourceStateManager()

    async getSourceMenu(): Promise<DUISection> {
        return App.createDUISection({
            id: 'sourceMenu',
            header: 'Source Menu',
            isHidden: false,
            rows: async () => [
                this.sourceSettings(this.stateManager)
            ]
        })
    }

    sourceSettings = (stateManager: SourceStateManager): DUINavigationButton => App.createDUINavigationButton({
        id: 'mangastream_settings',
        label: 'Source Settings',
        form: App.createDUIForm({
            sections: async () => [
                App.createDUISection({
                    id: 'domain',
                    isHidden: false,
                    footer: 'Override the domain url for the source.',
                    rows: async () => [
                        App.createDUIInputField({
                            id: 'domain_url',
                            label: 'Domain',
                            value: App.createDUIBinding({
                                get: async () => await this.getAndSetBaseUrl(),
                                set: async (newValue) => await stateManager.store('Domain', newValue)
                            })
                        })
                    ]
                })
            ]
        })
    })

    parser = new MangaStreamParser()

    // ----REQUEST MANAGER----
    requestManager = App.createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                const url: string = await this.getAndSetBaseUrl()
                request.headers = {
                    ...(request.headers ?? {}), ...{
                        //'user-agent': await this.requestManager.getDefaultUserAgent(),
                        referer: `${url}/`, ...((request.url.includes('wordpress.com') || request.url.includes('wp.com')) && {
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

                if (isImgLink(request.url)) {
                    let overrideUrl: string = await this.stateManager.retrieve('Domain')
                    if (overrideUrl && overrideUrl != this.baseUrl) {
                        const basePath: any = simpleUrl.parse(this.baseUrl, true)
                        const overridePath: any = simpleUrl.parse(overrideUrl, true)
                        if (path.host.includes(basePath.host) || path.host.includes(overridePath.host)) {
                            path.host = overridePath.host
                            request.url = simpleUrl.create(path)
                        }
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                this.interceptResponse(response)
                return response
            }
        }
    })

    interceptResponse(response: Response): void {
    }

    async interceptRequest(request: Request): Promise<void> {
    }

    /**
     * The URL of the website. Eg. https://mangadark.com without a trailing slash
     */
    finalUrl: string = ''
    abstract baseUrl: string
    async getAndSetBaseUrl(): Promise<string> {
        let url: string = await this.stateManager.retrieve('Domain') ?? this.baseUrl
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
        COMPLETED: 'COMPLETED'
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

    sections: Record<string, HomeSectionData> = {
        'popular_today': {
            ...DefaultHomeSectionData,
            section: createHomeSection('popular_today', 'Popular Today', true, HomeSectionType.singleRowLarge),
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
               ? `${this.finalUrl}/?p=${mangaId}/`
               : `${this.finalUrl}/${this.sourceTraversalPathName}/${mangaId}/`
    }

    getMangaData = async (mangaId: string): Promise<CheerioStatic> => await this.loadRequestData(this.getMangaShareUrl(mangaId))

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        console.log('getMangaDetails')
        await this.getAndSetBaseUrl()
        const $ = await this.getMangaData(mangaId)
        return this.parser.parseMangaDetails($, mangaId, this)
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
        let existingMappedChapterLink = await this.stateManager.retrieve(chapterKey)
        // If the Chapter List wasn't retrieved since the app was opened, retrieve it first and initialize it for all chapters
        if (existingMappedChapterLink == null) {
            await this.getChapters(mangaId)
        }

        existingMappedChapterLink = await this.stateManager.retrieve(chapterKey)
        if (existingMappedChapterLink == null) {
            throw new Error(`Could not parse out Chapter Link when getting chapter details for postId: ${mangaId} chapterId: ${chapterId}`)
        }

        return existingMappedChapterLink
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const chapterLink: string = await this.getChapterSlug(mangaId, chapterId)
        const url: string = await this.getAndSetBaseUrl()
        const $ = await this.loadRequestData(`${url}/${chapterLink}/`)
        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    async getSearchTags(): Promise<TagSection[]> {
        const url: string = await this.getAndSetBaseUrl()
        const $ = await this.loadRequestData(`${url}/${this.sourceTraversalPathName}`)
        return this.parser.parseTags($)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const request = await this.constructSearchRequest(page, query)
        const response = await this.requestManager.schedule(request, 1)
        this.CheckResponseErrors(response)
        const $ = this.cheerio.load(response.data as string)
        const results = await this.parser.parseSearchResults($, this)

        const manga: PartialSourceManga[] = []
        for (const result of results) {
            let mangaId: string = result.slug
            if (this.usePostIds) {
                mangaId = await this.slugToPostId(result.slug, result.path)
            }

            manga.push(App.createPartialSourceManga({
                mangaId,
                image: result.image,
                title: result.title,
                subtitle: result.subtitle
            }))
        }

        metadata = !this.parser.isLastPage($, query?.title ? 'search_request' : 'view_more')
                   ? { page: page + 1 }
                   : undefined

        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async constructSearchRequest(page: number, query: SearchRequest): Promise<any> {
        const url: string = await this.getAndSetBaseUrl()
        let urlBuilder: URLBuilder = new URLBuilder(url)
            .addPathComponent(this.sourceTraversalPathName)
            .addQueryParameter('page', page.toString())

        if (query?.title) {
            urlBuilder = urlBuilder.addQueryParameter('s', encodeURIComponent(query?.title.replace(/[’–][a-z]*/g, '') ?? ''))
        } else {
            urlBuilder = urlBuilder
                .addQueryParameter('genre', getFilterTagsBySection('genres', query?.includedTags, true))
                .addQueryParameter('genre', getFilterTagsBySection('genres', query?.excludedTags, false, await this.supportsTagExclusion()))
                .addQueryParameter('status', getIncludedTagBySection('status', query?.includedTags))
                .addQueryParameter('type', getIncludedTagBySection('type', query?.includedTags))
                .addQueryParameter('order', getIncludedTagBySection('order', query?.includedTags))
        }

        return App.createRequest({
            url: urlBuilder.buildUrl({
                addTrailingSlash: true,
                includeUndefinedParameters: false
            }),
            method: 'GET'
        })
    }

    async supportsTagExclusion(): Promise<boolean> {
        return false
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const url: string = await this.getAndSetBaseUrl()
        const $ = await this.loadRequestData(`${url}/`)

        const promises: Promise<void>[] = []
        const sectionValues = Object.values(this.sections).sort((n1, n2) => n1.sortIndex - n2.sortIndex)
        for (const section of sectionValues) {
            if (!section.enabled) {
                continue
            }
            // Let the app load empty sections
            sectionCallback(section.section)
        }

        for (const section of sectionValues) {
            if (!section.enabled) {
                continue
            }

            promises.push(new Promise(async () => {
                section.section.items = await this.parser.parseHomeSection($, section, this)
                sectionCallback(section.section)
            }))
        }

        // Make sure the function completes
        await Promise.all(promises)
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const param = this.sections[homepageSectionId]!.getViewMoreItemsFunc(page) ?? undefined
        if (!param) {
            throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }

        const url: string = await this.getAndSetBaseUrl()
        const $ = await this.loadRequestData(`${url}/${param}`)

        const items: PartialSourceManga[] = await this.parser.parseViewMore($, this)
        metadata = !this.parser.isLastPage($, 'view_more')
                   ? { page: page + 1 }
                   : undefined

        return App.createPagedResults({
            results: items,
            metadata
        })
    }

    async slugToPostId(slug: string, path: string): Promise<string> {
        if ((await this.stateManager.retrieve(slug)) == null) {
            const postId = await this.convertSlugToPostId(slug, path)

            const existingMappedSlug = await this.stateManager.retrieve(postId)
            if (existingMappedSlug != null) {
                await this.stateManager.store(slug, undefined)
            }

            await this.stateManager.store(postId, slug)
            await this.stateManager.store(slug, postId)
        }

        const postId = await this.stateManager.retrieve(slug)
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
        // Credit to the MadaraDex team :-D
        const url: string = await this.getAndSetBaseUrl()
        const headRequest = App.createRequest({
            url: `${url}/${path}/${slug}/`,
            method: 'HEAD'
        })
        const headResponse = await this.requestManager.schedule(headRequest, 1)
        this.CheckResponseErrors(headResponse)

        let postId: any

        const postIdRegex = headResponse?.headers.Link?.match(/\?p=(\d+)/)
        if (postIdRegex?.[1]) {
            postId = postIdRegex[1]
        }

        if (postId || !isNaN(Number(postId))) {
            return postId?.toString()
        }

        const $ = await this.loadRequestData(`${url}/${path}/${slug}/`)

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
        const request = App.createRequest({
            url,
            method
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CheckResponseErrors(response)
        return this.cheerio.load(response.data as string)
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        const url: string = await this.getAndSetBaseUrl()
        return App.createRequest({
            url: `${this.bypassPage || url}/`,
            method: 'GET',
            headers: {
                'referer': `${url}/`,
                'origin': `${url}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }

    CheckResponseErrors(response: Response): void {
        const status = response.status
        switch (status) {
            case 403:
            case 503:
                throw new Error('CLOUDFLARE DETECTED:\nDo the Cloudflare bypass by clicking the cloud icon!')
            case 404:
                throw new Error(`The requested page ${response.request.url} was not found!`)
        }
    }
}