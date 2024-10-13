/* eslint-disable linebreak-style */

import {
    CatalogRating,
    Chapter,
    ChapterData,
    Content,
    ContentSource,
    DirectoryConfig,
    DirectoryFilter,
    DirectoryHandler,
    DirectoryRequest,
    Form,
    Highlight,
    ImageRequestHandler,
    NetworkClientBuilder,
    NetworkRequest,
    PagedResult,
    PageLink,
    PageLinkResolver,
    PageSection,
    Property,
    ResolvedPageSection,
    RunnerInfo,
    SectionStyle,
    RunnerPreferenceProvider
} from '@suwatte/daisuke'
import { AsuraScansParser } from './AsuraScansParser'
import { UITextField } from '@suwatte/daisuke/dist/types/UI/UIElementBuilders'
import {
    FilterProps,
    StatusTypes
} from './AsuraScansInterfaces'
import {
    checkResponseErrors,
    createHomeSection,
    DefaultHomeSectionData,
    getMangaSlug,
    getSelectValue,
    HomeSectionData,
    loadCheerioData,
    loadRequestData
} from './AsuraScansHelper'

import { decode as decodeHTMLEntity } from 'html-entities'
import { load } from 'cheerio'
import { URLBuilder } from './UrlBuilder'

const simpleUrl = require('simple-url')

const ASURASCANS_DOMAIN = 'https://asuracomic.net'
const ASURASCANS_API_DOMAIN = 'https://gg.asuracomic.net'

export class Target implements ContentSource, PageLinkResolver, ImageRequestHandler, DirectoryHandler, RunnerPreferenceProvider {

    info: RunnerInfo = {
        id: 'AsuraScans',
        version: 2.11,
        name: 'AsuraScans',
        thumbnail: 'AsuraScans.png',
        rating: CatalogRating.MIXED,
        website: ASURASCANS_DOMAIN,
    }

    parser = new AsuraScansParser()

    language: string = 'en_GB'

    sourceTraversalPathName = 'series'

    fallbackImage = 'https://i.imgur.com/GYUxEX8.png'

    manga_StatusTypes: StatusTypes = {
        COMINGSOON: 'COMING SOON',
        HIATUS: 'HIATUS',
        SEASONEND: 'SEASON END',
        ONGOING: 'ONGOING',
        COMPLETED: 'COMPLETED',
        DROPPED: 'DROPPED'
    }

    sections: Record<'popular_today' | 'latest_update', HomeSectionData> = {
        'popular_today': {
            ...DefaultHomeSectionData,
            section: createHomeSection('popular_today', 'Popular Today', false, SectionStyle.GALLERY),
            selectorFunc: ($: CheerioStatic) => $('div.group', $('h3:contains(Popular Today)')?.parent()?.next()?.next()),
            titleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('span.block', element).text().trim(),
            subtitleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('span.block', element)?.next()?.text().trim(),
            sortIndex: 10
        },
        'latest_update': {
            ...DefaultHomeSectionData,
            section: createHomeSection('latest_update', 'Latest Updates', false, SectionStyle.ITEM_LIST),
            selectorFunc: ($: CheerioStatic) => $('div.w-full', $('h3:contains(Latest Updates)')?.parent()?.next()),
            titleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('span.font-medium', element).text().trim(),
            subtitleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => {
                let text = $('span.inline-block', element).toArray()
                let tags = []
                for (let tag of text) {
                    let chapterTitle = $('span.flex', tag).text()
                    let hiddenObj = $('div.hidden', tag)
                    if (hiddenObj.length != 0) {
                        let hiddenText = hiddenObj.text()
                        if (hiddenText.includes('-')) {
                            hiddenText = hiddenText.split('-')[0] ?? ''
                        }

                        chapterTitle = hiddenText.trim()
                    }

                    tags.push(decodeHTMLEntity(`${chapterTitle} - ${$('p.ml-2', tag).text()}`))
                }

                return tags
            },
            getViewMoreItemsFunc: (page: string) => `page/${page}`,
            sortIndex: 20,
        }
    }

    client: NetworkClient = new NetworkClientBuilder()
        .setRateLimit(15, 1)
        .setTimeout(30000)
        .addRequestInterceptor(async (request) => {
            const url: string = await this.getBaseUrl()
            request.headers = {
                ...(request.headers ?? {}),
                ...{
                    referer: `${url}/`
                }
            }

            const path: any = simpleUrl.parse(request.url, true)
            if (!path.protocol || path.protocol == 'http') {
                path.protocol = 'https'
                request.url = simpleUrl.create(path)
            }

            return request
        })
        .addResponseInterceptor(async (response) => {
            if (response.headers.location) {
                response.headers.location = response.headers.location.replace(/^http:/, 'https:')
            }
            return response
        })
        .build()

    async getPreferenceMenu(): Promise<Form> {
        return {
            sections: [
                {
                    footer: 'Override the domain url for the source.',
                    children: [
                        UITextField({
                            id: 'domain',
                            title: 'Domain',
                            value: await this.getBaseUrl(),
                            async didChange(value) {
                                return ObjectStore.set('Domain', value)
                            }
                        })
                    ]
                }
            ]
        }
    }

    async getBaseUrl(): Promise<string> {
        const settingsUrl: string = await ObjectStore.string('Domain') ?? ASURASCANS_DOMAIN
        return settingsUrl ? settingsUrl : ASURASCANS_DOMAIN
    }

    async getMangaShareUrl(mangaId: string): Promise<string> {
        const slug: string | null = await getMangaSlug(mangaId)
        if (!slug) {
            throw new Error(`Couldn't find a url for mangaId ${mangaId}, try migrating the title or contact a developer!`)
        }

        const url: string = await this.getBaseUrl()
        return `${url}/${slug}`
    }

    async getMangaData(mangaId: string): Promise<string> {
        const url = await this.getMangaShareUrl(mangaId)
        return await loadRequestData(this.client, url)
    }

    async getContent(mangaId: string): Promise<Content> {
        const data = await this.getMangaData(mangaId)
        return await this.parser.parseMangaDetails(data, mangaId, this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        throw new Error('getChapters is not implemented!')
    }

    async getChapterData(mangaId: string, chapterId: string, chapter?: Chapter): Promise<ChapterData> {
        const chapterLink: string = chapter?.webUrl ?? ''
        if (chapterLink.length == 0) {
            throw new Error(`Could not get Chapter Data for mangaId: ${mangaId} chapterId: ${chapterId} because the webUrl was empty!`)
        }

        const url: string = await this.getBaseUrl()
        const data = await loadRequestData(this.client, `${url}/${chapterLink}/`)
        return this.parser.parseChapterDetails(data)
    }

    async getFilters(): Promise<DirectoryFilter[]> {
        const data = await loadRequestData(this.client, `${ASURASCANS_API_DOMAIN}/api/series/filters`)

        return this.parser.parseTags(data)
    }

    async getTags(): Promise<Property[]> {
        const filters = await this.getFilters()
        return [
            {
                id: "genres",
                title: "Genres",
                tags: filters.find(x => x.id == "genres")?.options!
            }
        ]
    }

    async getDirectory(searchRequest: DirectoryRequest<FilterProps>): Promise<PagedResult> {
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

            if (isLastPage)
                break
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
        checkResponseErrors(response)
        const $ = load(response.data as string, { _useHtmlParser2: true })
        const results = await this.parser.parseSearchResults($, this)

        const chapterTag =  query?.filters?.chapters

        const manga: Highlight[] = []
        for (const result of results) {
            if (chapterTag) {
                const chapterCount = parseInt(chapterTag)
                const chapterCountRegex = result.subtitle?.match(/(\d+)/)
                if (!chapterCountRegex || chapterCountRegex?.[1] && parseInt(chapterCountRegex[1]) < chapterCount)
                    continue
            }

            manga.push({
                id: result.mangaId,
                cover: result.image,
                title: result.title,
                subtitle: result.subtitle
            })
        }

        return {
            isLastPage: this.parser.isLastPage($),
            manga
        }
    }

    async constructSearchRequest(page: number, query: DirectoryRequest<FilterProps>): Promise<any> {
        const url: string = await this.getBaseUrl()
        let urlBuilder: URLBuilder = new URLBuilder(url)
            .addPathComponent(this.sourceTraversalPathName)
            .addQueryParameter('page', page.toString())

        if (query?.query) {
            urlBuilder = urlBuilder.addQueryParameter('name', encodeURIComponent(query?.query.replace(/[’‘´`'\-][a-z]*/g, '%') ?? ''))
        }

        urlBuilder = urlBuilder
            .addQueryParameter('genres', query.filters?.genres)
            .addQueryParameter('status', getSelectValue(query?.filters?.status))
            .addQueryParameter('types', getSelectValue(query?.filters?.type))
            .addQueryParameter('order', getSelectValue(query?.filters?.order))

        return {
            url: urlBuilder.buildUrl({
                addTrailingSlash: false,
                includeUndefinedParameters: false
            }),
            method: 'GET'
        }
    }

    async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
        if (link.id !== "home")
            throw new Error("Accessing invalid page")

        const url: string = await this.getBaseUrl()
        const $ = await loadCheerioData(this.client, `${url}/`)

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
        return await Promise.all(promises)
    }

    async willRequestImage(url: string): Promise<NetworkRequest> {
        const baseUrl = await this.getBaseUrl()
        return {
            url,
            headers: {
                'referer': `${baseUrl}/`,
                'Accept': 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
                'Accept-Encoding' : 'gzip, deflate, br, zstd'
                //'origin': `${baseUrl}/`,
            }
        }
    }

    resolvePageSection(link: PageLink, sectionID: string): Promise<ResolvedPageSection> {
        throw new Error('Method not needed.')
    }
}