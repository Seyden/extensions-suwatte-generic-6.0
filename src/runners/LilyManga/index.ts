import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://lilymanga.net'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'LilyManga',
        version: getExportVersion('0.0'),
        name: 'LilyManga',
        thumbnail: 'LilyManga.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}