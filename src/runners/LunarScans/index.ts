import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const DOMAIN = 'https://lunarscan.org'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'LunarScans',
        version: getExportVersion('0.0'),
        name: 'LunarScans',
        thumbnail: 'LuaScans.png',
        rating: CatalogRating.NSFW,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override sourceTraversalPathName = 'series'

    override configureSections() {
        this.sections['new_titles'].enabled = false
    }
}