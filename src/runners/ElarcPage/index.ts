import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../MangaStream'

const DOMAIN = 'https://elarctoon.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'ElarcPage',
        version: getExportVersion('0.0'),
        name: 'ElarcPage',
        thumbnail: 'ElarcPage.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override sourceTraversalPathName = 'nowstreaming'

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }
}