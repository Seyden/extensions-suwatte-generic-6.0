import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://dragontea.ink'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'DragonTea',
        version: getExportVersion('0.0'),
        name: 'DragonTea',
        thumbnail: 'DragonTea.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}