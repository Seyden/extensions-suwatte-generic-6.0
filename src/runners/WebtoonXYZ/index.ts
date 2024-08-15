import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://www.webtoon.xyz'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'WebtoonXYZ',
        version: getExportVersion('0.0'),
        name: 'WebtoonXYZ',
        thumbnail: 'WebtoonXYZ.png',
        rating: CatalogRating.NSFW,
        website: DOMAIN,
        
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}