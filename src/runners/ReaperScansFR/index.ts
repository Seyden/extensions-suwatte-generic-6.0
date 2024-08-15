import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

import { ReaperScansFRParser } from './ReaperScansFRParser'

const DOMAIN = 'https://reaperscans.fr'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ReaperScansFR',
        version: getExportVersion('0.0'),
        name: 'ReaperScansFR',
        thumbnail: 'ReaperScansFR.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
        
    }

    baseUrl: string = DOMAIN

    override language = 'fr_FR'

    override chapterEndpoint = 1

    override parser: ReaperScansFRParser = new ReaperScansFRParser()
}