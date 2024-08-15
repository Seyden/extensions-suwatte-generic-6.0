import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://manhwatop.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ManhwaTop',
        version: getExportVersion('0.0'),
        name: 'ManhwaTop',
        thumbnail: 'ManhwaTop.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN
}