import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://lhtranslation.net'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'LHTranslation',
        version: getExportVersion('0.0'),
        name: 'LHTranslation',
        thumbnail: 'LHTranslation.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}