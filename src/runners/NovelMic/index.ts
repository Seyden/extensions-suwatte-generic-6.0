import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://novelmic.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'NovelMic',
        version: getExportVersion('0.0'),
        name: 'NovelMic',
        thumbnail: 'NovelMic.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN
}