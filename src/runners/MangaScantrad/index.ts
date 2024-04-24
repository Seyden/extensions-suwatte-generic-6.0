import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://manga-scantrad.io'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'MangaScantrad',
        version: getExportVersion('0.0'),
        name: 'MangaScantrad',
        thumbnail: 'MangaScantrad.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override language = 'fr_FR'

    override chapterEndpoint = 1
}