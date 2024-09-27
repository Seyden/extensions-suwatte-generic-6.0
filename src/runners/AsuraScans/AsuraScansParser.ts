/* eslint-disable linebreak-style */
import {
    Chapter,
    ChapterData,
    ChapterPage,
    Content,
    ContentType,
    FilterType,
    Highlight,
    Property,
    PublicationStatus
} from '@suwatte/daisuke'

import {
    extractMangaData,
    HomeSectionData
} from './AsuraScansHelper'

import { decode as decodeHTMLEntity } from 'html-entities'
import { load } from 'cheerio'

export class AsuraScansParser{
    async parseMangaDetails(data: string, mangaId: string, source: any): Promise<Content> {
        const tempData = data.replace(/\\"/g, '"').replace(/\\\\"/g, '\\"')
        const obj = extractMangaData(tempData, "comic") ?? ''
        if (obj == '') {
            throw new Error(`Failed to parse comic object for manga ${mangaId}`) // If null, throw error, else parse data to json.
        }

        const $ = load(data, { _useHtmlParser2: true })

        const comicObj = JSON.parse(obj)

        const title = comicObj.comic.name.trim()
        const author = comicObj.comic.author?.trim()
        const artist = comicObj.comic.artist?.trim()
        const image = comicObj.comic.thumb
        const covers = [comicObj.comic.cover]
        const description = decodeHTMLEntity($('span.font-medium').text().trim().replace(/\\r\\n/gm, '\n'))
        //const rating = comicObj.comic.rating

        let slug = comicObj.comic.slug?.trim()
        if (slug)  {
            slug = `series/${slug}`
            await source.setMangaSlug(mangaId, slug)
        }

        const rawStatus = comicObj.comic.status?.name?.trim() ?? ''
        let status
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
            case source.manga_StatusTypes.HIATUS.toLowerCase():
                status = PublicationStatus.HIATUS
                break
            case source.manga_StatusTypes.SEASONEND.toLowerCase():
                status = PublicationStatus.HIATUS
                break
            case source.manga_StatusTypes.COMINGSOON.toLowerCase():
                status = PublicationStatus.ONGOING
                break
            default:
                status = PublicationStatus.ONGOING
                break
        }

        const properties: Property[] = [
            {
                id: "genres",
                title: "Genres",
                tags: comicObj.comic.genres.map((genre: any) => ({
                    id: genre.id.toString(),
                    title: genre.name
                }))
            },
            ... author || artist ? [{
                id: "creators",
                title: "Credits",
                tags: [
                    ... author ? [{
                        title: author,
                        id: `author-${author}`,
                        noninteractive: true
                    }] : [],
                    ... artist ? [{
                        title: artist,
                        id: `artist-${artist}`,
                        noninteractive: true
                    }] : [],
                ],
            }] : []
        ]

        const chapters = await this.parseChapterList(tempData, mangaId, source, slug)

        return {
            title: title,
            status,
            properties,
            summary: description,
            cover: image || source.fallbackImage,
            additionalCovers: covers,
            ...(chapters.length > 0 && { chapters }),
            contentType: ContentType.MANHWA
        }
    }

    async parseChapterList(data: string, mangaId: string, source: any, mangaSlug: string): Promise<Chapter[]> {
        let obj = extractMangaData(data, "chapters") ?? ''
        if (obj == '') {
            throw new Error(`Failed to parse chapters object for manga ${mangaId}`) // If null, throw error, else parse data to json.
        }

        const chaptersObj = JSON.parse(obj)

        const chapters: Chapter[] = []
        let sortingIndex = 0

        for (const chapter of chaptersObj.chapters.reverse())
        {
            const id = chapter.id.toString()
            if (!id || typeof id === 'undefined') {
                throw new Error(`Could not parse out ID when getting chapters for postId:${mangaId}`)
            }

            const title = chapter.title
            const name = chapter.name
            const publishedDate = chapter.published_at
            const link = `${mangaSlug}/chapter/${name}`

            chapters.push({
                chapterId: id,
                language: source.language,
                number: name,
                title: !title ? `Chapter ${name}` : title,
                date: new Date(publishedDate),
                index: sortingIndex,
                volume: 0,
                webUrl: link
            })
            sortingIndex++
        }

        return chapters
    }

    parseChapterDetails(data: string): ChapterData {
        const pages: ChapterPage[] = []

        const $ = load(data, { _useHtmlParser2: true })

        for (const img of $('img', 'div.py-8.-mx-5').toArray()) {
            const image = $(img).attr('src') ?? ''
            if (!image) continue
            pages.push({ url: image.trim() })
        }

        return {
            pages: pages
        }
    }

    parseTags(data: string) {
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
            { id: 'genres', title: 'Genres', type: FilterType.MULTISELECT, tags: [] },
            { id: 'status', title: 'Status', type: FilterType.SELECT, tags: [] },
            { id: 'type', title: 'Type', type: FilterType.SELECT, tags: [] },
            { id: 'order', title: 'Order', type: FilterType.SELECT, tags: [] }
        ]

        const filters = JSON.parse(data)
        filters.types.forEach((type: any) => { tagSections[3]!.tags.push({ id: type.id.toString(), title: type.name }) })
        filters.genres.forEach((type: any) => { tagSections[1]!.tags.push({ id: type.id.toString(), title: type.name }) })
        filters.statuses.forEach((type: any) => { tagSections[2]!.tags.push({ id: type.id.toString(), title: type.name }) })
        filters.order.forEach((type: any) => { tagSections[4]!.tags.push({ id: type.name, title: type.value }) })

        return tagSections
    }

    async parseSearchResults($: CheerioSelector, source: any): Promise<any[]> {
        const results: any[] = []

        const mangas = $('a', $('h3:contains(Series list)')?.parent()?.next()?.next())
        if (!mangas.length) {
            console.log(`Unable to parse search results!`)
            return results
        }

        for (const manga of mangas.toArray()) {
            const slug = $(manga).attr('href') ?? ''
            if (!slug) {
                throw new Error(`Unable to parse slug (${slug})!`)
            }

            const image = this.getImageSrc($('img', manga))
            const title: string = $('span.block', manga).text().trim()
            const subtitle = $('span.block', manga)?.next()?.text().trim() ?? ''
            const mangaId: string = this.idCleaner(slug ?? '')

            await source.setMangaSlug(mangaId, slug)

            results.push({
                mangaId,
                image: image || source.fallbackImage,
                title: decodeHTMLEntity(title),
                subtitle: decodeHTMLEntity(subtitle)
            })
        }

        return results
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
            const subtitleResult = section.subtitleSelectorFunc($, manga)
            const subtitle = Array.isArray(subtitleResult) ? '' : decodeHTMLEntity(subtitleResult) ?? ''
            const href = $('a', manga).attr('href') ?? ''
            const mangaId: string = this.idCleaner(href ?? '')

            if (!mangaId) {
                console.log(`Failed to parse homepage sections for ${source.baseUrl} title (${title}) mangaId (${mangaId})`)
                continue
            }

            await source.setMangaSlug(mangaId, href)

            items.push({
                id: mangaId,
                cover: image || source.fallbackImage,
                title: decodeHTMLEntity(title),
                info: Array.isArray(subtitleResult) ? subtitleResult  : [subtitle],
                webUrl: href
            })
        }

        return items
    }

    isLastPage = ($: CheerioStatic): boolean => {
        let isLast = true
        const obj = $('a:contains(Next)')
        const hasNext = obj.attr('style')?.includes('pointer-events:auto') ?? false
        if (hasNext) {
            isLast = false
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

        return decodeURI(decodeHTMLEntity(image?.trim() ?? ''))
    }

    protected idCleaner(str: string): string {
        let cleanId: string | null = str
        cleanId = cleanId.replace(/\/$/, '')
        cleanId = cleanId.split('/').pop() ?? null
        // Remove randomised slug part
        cleanId = cleanId?.substring(0, cleanId?.lastIndexOf('-')) ?? null

        if (!cleanId) {
            throw new Error(`Unable to parse id for ${str}`)
        }

        return cleanId
    }

}