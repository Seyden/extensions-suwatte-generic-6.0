import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://gourmetsupremacy.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'GourmetScans',
        version: getExportVersion('0.0'),
        name: 'GourmetScans',
        thumbnail: 'GourmetScans.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override hasProtectedChapters = true

    override useListParameter = false
}