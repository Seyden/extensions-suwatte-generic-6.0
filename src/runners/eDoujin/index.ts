/* eslint-disable linebreak-style */
import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const EDOUJIN_DOMAIN = 'https://edoujin.net'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'eDoujin',
        version: getExportVersion('0.0'),
        name: 'eDoujin',
        thumbnail: 'eDoujin.png',
        rating: CatalogRating.NSFW,
        website: EDOUJIN_DOMAIN,
    }

    baseUrl: string = EDOUJIN_DOMAIN

    override configureSections() {
        this.sections['latest_update'].enabled = false
        this.sections['new_titles'].enabled = false
    }
}