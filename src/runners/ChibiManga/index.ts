import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://www.cmreader.info'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ChibiManga',
        version: getExportVersion('0.0'),
        name: 'ChibiManga',
        thumbnail: 'ChibiManga.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}