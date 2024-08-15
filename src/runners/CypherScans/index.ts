import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const DOMAIN = 'https://cypherscans.xyz'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'CypherScans',
        version: getExportVersion('0.0'),
        name: 'CypherScans',
        thumbnail: 'CypherScans.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }
}