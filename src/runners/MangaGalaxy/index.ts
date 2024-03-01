import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://mangagalaxy.me'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'MangaGalaxy',
        version: getExportVersion('0.0'),
        name: 'MangaGalaxy',
        thumbnail: 'MangaGalaxy.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}