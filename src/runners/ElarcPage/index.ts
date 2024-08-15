import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const DOMAIN = 'https://elarctoons.biz'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'ElarcToon',
        version: getExportVersion('0.0'),
        name: 'ElarcToon',
        thumbnail: 'ElarcToon.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override sourceTraversalPathName = 'library'

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }
}