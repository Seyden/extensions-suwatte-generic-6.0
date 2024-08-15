/* eslint-disable linebreak-style */
import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const XCALIBRSCANS_DOMAIN = 'https://xcalibrscans.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'xCalibrScans',
        version: getExportVersion('0.0'),
        name: 'xCalibrScans',
        thumbnail: 'xCalibrScans.png',
        rating: CatalogRating.MIXED,
        website: XCALIBRSCANS_DOMAIN,
    }

    baseUrl: string = XCALIBRSCANS_DOMAIN

    override configureSections() {
        this.sections['new_titles'].enabled = false
    }

}