import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://manhuafast.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ManhuaFast',
        version: getExportVersion('0.0'),
        name: 'ManhuaFast',
        thumbnail: 'ManhuaFast.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override bypassPage = `${DOMAIN}/?p`
}