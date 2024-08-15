import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const DOMAIN = 'https://freakscans.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'FreakScans',
        version: getExportVersion('0.0'),
        name: 'FreakScans',
        thumbnail: 'FreakScans.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override configureSections() {
        this.sections['new_titles'].enabled = false
    }
}