import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://mangabob.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'MangaBob',
        version: getExportVersion('0.0'),
        name: 'MangaBob',
        thumbnail: 'MangaBob.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN
}