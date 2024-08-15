/* eslint-disable linebreak-style */
import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const READKOMIK_DOMAIN = 'https://readkomik.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'ReadKomik',
        version: getExportVersion('0.0'),
        name: 'ReadKomik',
        thumbnail: 'ReadKomik.png',
        rating: CatalogRating.MIXED,
        website: READKOMIK_DOMAIN,
    }

    baseUrl: string = READKOMIK_DOMAIN

    override configureSections() {
        this.sections['new_titles'].enabled = false
    }
}