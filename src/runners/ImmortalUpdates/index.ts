import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://immortalupdates.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ImmortalUpdates',
        version: getExportVersion('0.0'),
        name: 'ImmortalUpdates',
        thumbnail: 'ImmortalUpdates.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}