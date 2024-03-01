import {
    Content,
    Property,
    PublicationStatus,
    Tag
} from '@suwatte/daisuke'

import {
    Parser
} from '../../MadaraParser'

export class SamuraiScanParser extends Parser {

    override async parseMangaDetails($: CheerioStatic, mangaId: string, source: any): Promise<Content> {
        const title: string = this.decodeHTMLEntity($('div.post-title h1, div#manga-title h1').children().remove().end().text().trim())
        const description: string = this.decodeHTMLEntity($('div.manga-excerpt').first().text()).replace('Show more', '').trim()

        const image: string = encodeURI(await this.getImageSrc($('div.summary_image img').first(), source))
        const parsedStatus: string = $('div.summary-content', $('div.post-content_item').last()).text().trim()

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
            title,
            properties,
            status,
            summary: description,
            cover: image,
        }
    }
}