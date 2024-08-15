import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://teenmanhua.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'TeenManhua',
        version: getExportVersion('0.0'),
        name: 'TeenManhua',
        thumbnail: 'TeenManhua.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}