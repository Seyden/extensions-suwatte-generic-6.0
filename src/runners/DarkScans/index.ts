import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://darkscans.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'DarkScans',
        version: getExportVersion('0.0'),
        name: 'DarkScans',
        thumbnail: 'DarkScans.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}