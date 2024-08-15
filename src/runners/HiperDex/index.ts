import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://hiperdex.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'HiperDex',
        version: getExportVersion('0.0'),
        name: 'HiperDex',
        thumbnail: 'HiperDex.png',
        rating: CatalogRating.NSFW,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}