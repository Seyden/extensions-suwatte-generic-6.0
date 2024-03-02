import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../MangaStream'

const DOMAIN = 'https://suryatoon.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'SuryaScans',
        version: getExportVersion('0.0'),
        name: 'SuryaScans',
        thumbnail: 'SuryaScans.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override configureSections() {
        this.sections['new_titles'].enabled = false

    }
}