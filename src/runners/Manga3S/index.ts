import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://www.manga3s.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'Manga3S',
        version: getExportVersion('0.0'),
        name: 'Manga3S',
        thumbnail: 'Manga3S.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}