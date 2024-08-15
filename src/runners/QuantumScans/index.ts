import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const DOMAIN = 'https://qscomics.org'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'QuantumScans',
        version: getExportVersion('0.0'),
        name: 'QuantumScans',
        thumbnail: 'QuantumScans.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }
    baseUrl: string = DOMAIN

    override sourceTraversalPathName = 'series'

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }
}