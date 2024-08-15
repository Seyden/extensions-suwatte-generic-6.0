import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://pianmanga.me'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'PianManga',
        version: getExportVersion('0.0'),
        name: 'PianManga',
        thumbnail: 'PianManga.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override usePostIds = false
}