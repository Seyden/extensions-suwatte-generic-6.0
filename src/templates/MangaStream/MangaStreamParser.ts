import { convertDate } from './LanguageUtils'

import { HomeSectionData } from './MangaStreamHelper'

import { decode as decodeHTMLEntity } from 'html-entities'
import {
    Chapter,
    ChapterData,
    ChapterPage,
    Content,
    FilterType,
    Highlight,
    Property,
    PublicationStatus,
    Tag
} from '@suwatte/daisuke'

export class MangaStreamParser {
    async parseMangaDetails($: CheerioStatic, mangaId: string, source: any): Promise<Content> {
        const titles: string[] = []
        titles.push(decodeHTMLEntity($('h1.entry-title').text().trim()))

        const altTitles = $(`span:contains(${source.manga_selector_AlternativeTitles}), b:contains(${source.manga_selector_AlternativeTitles})+span, .imptdt:contains(${source.manga_selector_AlternativeTitles}) i, h1.entry-title+span`).contents().remove().last().text().split(',') //Language dependant
        for (const title of altTitles) {
            if (title == '') {
                continue
            }
            titles.push(decodeHTMLEntity(title.trim()))
        }

        const author = $(`span:contains(${source.manga_selector_author}), .fmed b:contains(${source.manga_selector_author})+span, .imptdt:contains(${source.manga_selector_author}) i`).contents().remove().last().text().trim() //Language dependant
        const artist = $(`span:contains(${source.manga_selector_artist}), .fmed b:contains(${source.manga_selector_artist})+span, .imptdt:contains(${source.manga_selector_artist}) i`).contents().remove().last().text().trim() //Language dependant
        const image = this.getImageSrc($('img', 'div[itemprop="image"]'))
        const description = decodeHTMLEntity($('div[itemprop="description"] p').text().trim())

        const arrayTags: Tag[] = []
        for (const tag of $('a', source.manga_tag_selector_box).toArray()) {
            const title = $(tag).text().trim()
            const id = encodeURI($(tag).attr('href')?.replace(`${source.baseUrl}/${source.manga_tag_TraversalPathName}/`, '').replace(/\//g, '') ?? '')
            if (!id || !title) {
                continue
            }
            arrayTags.push({
                id,
                title
            })
        }

        const rawStatus = $(`span:contains(${source.manga_selector_status}), .fmed b:contains(${source.manga_selector_status})+span, .imptdt:contains(${source.manga_selector_status}) i`).contents().remove().last().text().trim()
        let status: PublicationStatus
        switch (rawStatus.toLowerCase()) {
            case source.manga_StatusTypes.DROPPED.toLowerCase():
                status = PublicationStatus.CANCELLED
                break
            case source.manga_StatusTypes.ONGOING.toLowerCase():
                status = PublicationStatus.ONGOING
                break
            case source.manga_StatusTypes.COMPLETED.toLowerCase():
                status = PublicationStatus.COMPLETED
                break
            default:
                status = PublicationStatus.ONGOING
                break
        }

        const properties: Property[] = [
            {
                id: "genres",
                title: "Genres",
                tags: arrayTags
            },
            ... author != '' || artist != '' ? [{
                id: "creators",
                title: "Credits",
                tags: [
                    ... author != '' ? [{
                        title: author,
                        id: `author-${author}`,
                        noninteractive: true
                    }] : [],
                    ... artist != '' ? [{
                        title: artist,
                        id: `artist-${artist}`,
                        noninteractive: true
                    }] : [],
                ],
            }] : []
        ]

        const chapters = await this.parseChapterList($, mangaId, source)

        return {
            title: titles[0]!,
            additionalTitles: titles,
            status,
            properties,
            summary: description,
            cover: image || source.fallbackImage,
            ...(chapters.length > 0 && { chapters })
        }
    }

    async parseChapterList($: CheerioSelector, mangaId: string, source: any): Promise<Chapter[]> {
        const chapters: Chapter[] = []
        let sortingIndex = 0
        let langCode = source.language

        // Usually for Manhwa sites
        if (mangaId.toUpperCase().endsWith('-RAW') && source.language == 'en_GB') {
            langCode = 'ko_KR'
        }

        for (const chapter of $('li', 'div#chapterlist').toArray()) {
            const title = $('span.chapternum', chapter).text().trim()
            const link = this.idCleaner($('a', chapter).attr('href') ?? '')
            const date = convertDate($('span.chapterdate', chapter).text().trim(), source)
            const getNumber = chapter.attribs['data-num'] ?? ''
            const chapterNumberRegex = getNumber.match(/(\d+\.?\d?)+/)
            let chapterNumber = 0
            if (chapterNumberRegex && chapterNumberRegex[1]) {
                chapterNumber = Number(chapterNumberRegex[1])
            }

            let id = chapterNumber.toString()
            if (!id || typeof id === 'undefined') {
                throw new Error(`Could not parse out ID when getting chapters for postId:${mangaId}`)
            }

            chapters.push({
                chapterId: chapterNumber.toString(),
                language: langCode,
                number: chapterNumber,
                title,
                date,
                index: sortingIndex,
                volume: 0,
                webUrl: link
            })
            sortingIndex++
        }

        return chapters
    }

    parseChapterDetails($: CheerioStatic, mangaId: string, chapterId: string): ChapterData {
        const data = $.html()

        const pages: ChapterPage[] = []

        // To avoid our regex capturing more scrips, we stop at the first match of ";", also known as the first ending the matching script.
        let obj: any = /ts_reader.run\((.[^;]+)\)/.exec(data)?.[1] ?? '' // Get the data else return null.
        if (obj == '') {
            throw new Error(`Failed to find page details script for manga ${mangaId}`) // If null, throw error, else parse data to json.
        }

        obj = JSON.parse(obj)

        if (!obj?.sources) {
            throw new Error(`Failed for find sources property for manga ${mangaId}`)
        }

        for (const index of obj.sources) {
            // Check all sources, if empty continue.
            if (index?.images.length == 0) {
                continue
            }

            index.images.map((p: string) => {
                if (this.renderChapterImage(p)) {
                    pages.push({ url: encodeURI(p) })
                }
            })
        }

        return {
            pages
        }
    }

    renderChapterImage(path: string): boolean {
        return true
    }

    parseTags($: CheerioSelector, supportsTagExclusion: boolean) {
        const tagSections = [
            { id: 'chapters', title: 'Chapters', type: FilterType.SELECT, tags: [
                    { id: '10', title: '+10' },
                    { id: '20', title: '+20' },
                    { id: '30', title: '+30' },
                    { id: '40', title: '+40' },
                    { id: '50', title: '+50' },
                    { id: '60', title: '+60' },
                    { id: '70', title: '+70' },
                    { id: '80', title: '+80' },
                    { id: '90', title: '+90' },
                    { id: '100', title: '+100' },
                    { id: '150', title: '+150' },
                    { id: '200', title: '+200' },
                    { id: '250', title: '+250' },
                ]},
            { id: 'genres', title: 'Genres', type: supportsTagExclusion ? FilterType.EXCLUDABLE_MULTISELECT : FilterType.MULTISELECT, tags: [] },
            { id: 'status', title: 'Status', type: FilterType.SELECT, tags: [] },
            { id: 'type', title: 'Type', type: FilterType.SELECT, tags: [] },
            { id: 'order', title: 'Order', type: FilterType.SELECT, tags: [] }
        ]

        const sectionDropDowns = $('ul.dropdown-menu.c4.genrez, ul.dropdown-menu.c1').toArray()
        for (let i = 1; i < 5; ++i) {
            const sectionDropdown = sectionDropDowns[i-1]
            if (!sectionDropdown) {
                continue
            }

            for (const tag of $('li', sectionDropdown).toArray()) {
                const title = $('label', tag).text().trim()
                const id = `${$('input', tag).attr('value')}`

                if (!id || !title) {
                    continue
                }

                tagSections[i]!.tags.push({ id, title })
            }
        }

        return tagSections
    }

    async parseSearchResults($: CheerioSelector, source: any): Promise<any[]> {
        const results: any[] = []

        for (const obj of $('div.bs', 'div.listupd').toArray()) {
            const slug: string = ($('a', obj).attr('href') ?? '').replace(/\/$/, '').split('/').pop() ?? ''
            const path: string = ($('a', obj).attr('href') ?? '').replace(/\/$/, '').split('/').slice(-2).shift() ?? ''
            if (!slug || !path) {
                throw new Error(`Unable to parse slug (${slug}) or path (${path})!`)
            }

            const title: string = $('a', obj).attr('title') ?? ''
            const image = this.getImageSrc($('img', obj))
            const subtitle = $('div.epxs', obj).text().trim()

            results.push({
                slug,
                path,
                image: image || source.fallbackImage,
                title: decodeHTMLEntity(title),
                subtitle: decodeHTMLEntity(subtitle)
            })
        }

        return results
    }

    async parseViewMore($: CheerioStatic, source: any): Promise<Highlight[]> {
        const items: Highlight[] = []

        for (const manga of $('div.bs', 'div.listupd').toArray()) {
            const title = $('a', manga).attr('title')
            const image = this.getImageSrc($('img', manga))
            const subtitle = $('div.epxs', manga).text().trim()

            const slug: string = this.idCleaner($('a', manga).attr('href') ?? '')
            const path: string = ($('a', manga).attr('href') ?? '').replace(/\/$/, '').split('/').slice(-2).shift() ?? ''
            const postId = $('a', manga).attr('rel')
            const mangaId: string = source.usePostIds
                                    ? (isNaN(Number(postId))
                                       ? await source.slugToPostId(slug, path)
                                       : postId)
                                    : slug

            if (!mangaId || !title) {
                console.log(`Failed to parse homepage sections for ${source.baseUrl}`)
                continue
            }

            items.push({
                id: mangaId,
                cover: image || source.fallbackImage,
                title: decodeHTMLEntity(title),
                subtitle: decodeHTMLEntity(subtitle)
            })
        }

        return items
    }

    async parseHomeSection($: CheerioStatic, section: HomeSectionData, source: any): Promise<Highlight[]> {
        const items: Highlight[] = []

        const mangas = section.selectorFunc($)
        if (!mangas.length) {
            console.log(`Unable to parse valid ${section.section.title} section!`)
            return items
        }

        for (const manga of mangas.toArray()) {
            const title = section.titleSelectorFunc($, manga)
            if (!title) {
                console.log(`Failed to parse homepage sections for ${source.baseUrl} title (${title})`)
                continue
            }

            const image = this.getImageSrc($('img', manga))
            const subtitle = section.subtitleSelectorFunc($, manga) ?? ''

            const slug: string = this.idCleaner($('a', manga).attr('href') ?? '')
            const path: string = ($('a', manga).attr('href') ?? '').replace(/\/$/, '').split('/').slice(-2).shift() ?? ''
            const postId = $('a', manga).attr('rel')
            const mangaId: string = source.usePostIds
                                    ? (isNaN(Number(postId))
                                       ? await source.slugToPostId(slug, path)
                                       : postId)
                                    : slug

            if (!mangaId) {
                console.log(`Failed to parse homepage sections for ${source.baseUrl} title (${title}) mangaId (${mangaId})`)
                continue
            }

            items.push({
                id: mangaId,
                cover: image || source.fallbackImage,
                title: decodeHTMLEntity(title),
                subtitle: decodeHTMLEntity(subtitle)
            })
        }

        return items
    }

    isLastPage = ($: CheerioStatic, id: string): boolean => {
        let isLast = true
        if (id == 'view_more') {
            const hasNext = Boolean($('a.r')[0])
            if (hasNext) {
                isLast = false
            }
        }

        if (id == 'search_request') {
            const hasNext = Boolean($('a.next.page-numbers')[0])
            if (hasNext) {
                isLast = false
            }
        }

        return isLast
    }

    protected getImageSrc(imageObj: Cheerio | undefined): string {
        let image: string | undefined
        const src = imageObj?.attr('src')
        const dataLazy = imageObj?.attr('data-lazy-src')
        const srcset = imageObj?.attr('srcset')
        const dataSRC = imageObj?.attr('data-src')

        if (typeof src != 'undefined' && !src?.startsWith('data')) {
            image = src
        } else if (typeof dataLazy != 'undefined' && !dataLazy?.startsWith('data')) {
            image = dataLazy
        } else if (typeof srcset != 'undefined' && !srcset?.startsWith('data')) {
            image = srcset?.split(' ')[0] ?? ''
        } else if (typeof dataSRC != 'undefined' && !dataSRC?.startsWith('data')) {
            image = dataSRC
        } else {
            image = 'https://i.imgur.com/GYUxEX8.png'
        }

        image = image?.split('?resize')[0] ?? ''

        return encodeURI(decodeURI(decodeHTMLEntity(image?.trim() ?? '')))
    }

    protected idCleaner(str: string): string {
        let cleanId: string | null = str
        cleanId = cleanId.replace(/\/$/, '')
        cleanId = cleanId.split('/').pop() ?? null

        if (!cleanId) {
            throw new Error(`Unable to parse id for ${str}`)
        }

        return cleanId
    }
}