import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://toonily.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'Toonily',
        version: getExportVersion('0.0'),
        name: 'Toonily',
        thumbnail: 'Toonily.png',
        rating: CatalogRating.NSFW,
        website: DOMAIN,
        
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override searchMangaSelector = 'div.page-item-detail.manga'
}