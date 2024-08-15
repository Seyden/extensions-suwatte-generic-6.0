import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://drakecomic.com'

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
}