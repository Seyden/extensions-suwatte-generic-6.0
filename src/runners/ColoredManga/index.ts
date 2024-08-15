import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://coloredmanga.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ColoredManga',
        version: getExportVersion('0.0'),
        name: 'ColoredManga',
        thumbnail: 'ColoredManga.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}