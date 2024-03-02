import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../MangaStream'

const DOMAIN = 'https://helscans.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'HelScans',
        version: getExportVersion('0.0'),
        name: 'HelScans',
        thumbnail: 'HelScans.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }
    baseUrl: string = DOMAIN

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }
}