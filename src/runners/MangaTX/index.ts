import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://mangatx.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'MangaTX',
        version: getExportVersion('0.0'),
        name: 'MangaTX',
        thumbnail: 'MangaTX.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}