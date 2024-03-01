import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://huntmanga.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'HuntManga',
        version: getExportVersion('0.0'),
        name: 'HuntManga',
        thumbnail: 'HuntManga.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}