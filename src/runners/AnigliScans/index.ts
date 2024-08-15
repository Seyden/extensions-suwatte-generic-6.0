import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const DOMAIN = 'https://anigliscans.xyz'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'AnigliScans',
        version: getExportVersion('0.0'),
        name: 'AnigliScans',
        thumbnail: 'AnigliScans.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override sourceTraversalPathName = 'series'

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }
}