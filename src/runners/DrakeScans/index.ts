import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://drakescans.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'DrakeScans',
        version: getExportVersion('0.0'),
        name: 'DrakeScans',
        thumbnail: 'DrakeScans.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}