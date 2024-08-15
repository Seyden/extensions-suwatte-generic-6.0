/* eslint-disable linebreak-style */
import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const DOMAIN = 'https://arvencomics.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'ArvenScans',
        version: getExportVersion('0.0'),
        name: 'ArvenScans',
        thumbnail: 'ArvenScans.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override sourceTraversalPathName = 'series'

    override configureSections() {
        this.sections['new_titles'].enabled = false
    }
}