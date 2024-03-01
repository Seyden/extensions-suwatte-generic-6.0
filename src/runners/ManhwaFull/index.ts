import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://manhwafull.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ManhwaFull',
        version: getExportVersion('0.0'),
        name: 'ManhwaFull',
        thumbnail: 'ManhwaFull.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}