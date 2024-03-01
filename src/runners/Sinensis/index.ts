import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://sinensisscans.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'Sinensis',
        version: getExportVersion('0.0'),
        name: 'Sinensis',
        thumbnail: 'Sinensis.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
        
    }

    baseUrl: string = DOMAIN

    override language = '🇵🇹'

    override chapterEndpoint = 1

    override hasProtectedChapters = true
}