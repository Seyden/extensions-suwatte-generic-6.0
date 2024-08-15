import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://mangaclash.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'MangaClash',
        version: getExportVersion('0.0'),
        name: 'MangaClash',
        thumbnail: 'MangaClash.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}