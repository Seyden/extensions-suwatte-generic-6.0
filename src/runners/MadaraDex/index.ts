import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://madaradex.org'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'Madaradex',
        version: getExportVersion('0.0'),
        name: 'Madaradex',
        thumbnail: 'Madaradex.png',
        rating: CatalogRating.NSFW,
        website: DOMAIN,
        
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override searchMangaSelector = 'div.c-tabs-item > div.row'
}