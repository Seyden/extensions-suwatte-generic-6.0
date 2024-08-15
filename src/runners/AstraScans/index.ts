import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const DOMAIN = 'https://astrascans.org'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'AstraScans',
        version: getExportVersion('0.0'),
        name: 'AstraScans',
        thumbnail: 'AstraScans.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }
}