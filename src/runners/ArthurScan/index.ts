import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://arthurscan.xyz'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ArthurScan',
        version: getExportVersion('0.0'),
        name: 'ArthurScan',
        thumbnail: 'ArthurScan.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN
    }

    baseUrl: string = DOMAIN

    override language = '🇵🇹'

    override chapterEndpoint = 1
}