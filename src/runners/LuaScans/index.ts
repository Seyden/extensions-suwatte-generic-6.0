import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const DOMAIN = 'https://luacomic.net'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'LuaScans',
        version: getExportVersion('0.0'),
        name: 'LuaScans',
        thumbnail: 'LuaScans.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }
}