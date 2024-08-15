import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://zinmanga.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ZinManga',
        version: getExportVersion('0.0'),
        name: 'ZinManga',
        thumbnail: 'ZinManga.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override usePostIds = false
}