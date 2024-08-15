import {
    Content,
    Property,
    PublicationStatus,
    Tag
} from '@suwatte/daisuke'

import {
    Parser
} from '../../templates/Madara/MadaraParser'

import { decode as decodeHTMLEntity } from 'html-entities'

export class KnightNoScanlationParser extends Parser {

    override async parseMangaDetails($: CheerioStatic, mangaId: string, source: any): Promise<Content> {
        const image: string = encodeURI(await this.getImageSrc($('div.summary_image img').first(), source))
        const titles: string[] = []
        titles.push(decodeHTMLEntity($('div.post-title h1, div#manga-title h1').children().remove().end().text().trim()))

        let parsedStatus = ''
        let description = ''

        for (const obj of $('div.post-content_item').toArray()) {
            switch (decodeHTMLEntity($('h5', obj).first().text()).trim().toUpperCase()) {
                case 'ALTERNATIVE':
                    titles.push(decodeHTMLEntity($('div.summary-content', obj).text().trim()))
                    break
                case 'STATUS':
                    parsedStatus = $('div.summary-content', obj).text().trim()
                    break
                case 'SUMMARY':
                    description = decodeHTMLEntity($('p', obj).text().trim())
                    break
            }
        }

        let status: PublicationStatus
        switch (parsedStatus.toUpperCase()) {
            case 'COMPLETED':
                status = PublicationStatus.COMPLETED
                break
            default:
                status = PublicationStatus.ONGOING
                break
        }

        const genres: Tag[] = []
        for (const obj of $('div.genres-content a').toArray()) {
            const label = $(obj).text()
            const id = $(obj).attr('href')?.split('/')[4] ?? label

            if (!label || !id) continue
            genres.push({ title: label, id: id })
        }

        const properties: Property[] = [
            {
                id: "genres",
                title: "Genres",
                tags: genres
            }
        ]

        return {
            title: titles[0]!,
            properties,
            status,
            additionalTitles: titles,
            summary: description,
            cover: image,
        }
    }
}