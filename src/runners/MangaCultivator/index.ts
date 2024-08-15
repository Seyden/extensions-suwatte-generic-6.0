import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://mangacult.org'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'MangaCultivator',
        version: getExportVersion('0.0'),
        name: 'MangaCultivator',
        thumbnail: 'MangaCultivator.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override hasProtectedChapters = true

    override usePostIds = true
}