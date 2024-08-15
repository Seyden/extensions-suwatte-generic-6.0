import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://manhuasy.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ManhuaSY',
        version: getExportVersion('0.0'),
        name: 'ManhuaSY',
        thumbnail: 'ManhuaSY.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override hasProtectedChapters = true

    override usePostIds = false

    override directoryPath = 'manhua'
}