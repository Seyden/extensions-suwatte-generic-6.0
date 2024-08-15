/* eslint-disable linebreak-style */
import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const LELMANGA_DOMAIN = 'https://www.lelmanga.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'LelManga',
        version: getExportVersion('0.0'),
        name: 'LelManga',
        thumbnail: 'LelManga.png',
        rating: CatalogRating.MIXED,
        website: LELMANGA_DOMAIN,
    }

    baseUrl: string = LELMANGA_DOMAIN
    override language: string = 'fr_FR'

    override manga_selector_author = 'Autheur'
    override manga_selector_artist = 'Artiste'

    override configureSections() {
        this.sections['popular_today'].selectorFunc = ($: CheerioStatic) => $('div.bsx', $('h2:contains(Top Managa Aujourd\'hui)')?.parent()?.next())
        this.sections['latest_update'].selectorFunc = ($: CheerioStatic) => $('div.uta', $('h2:contains(Dernières Sorties)')?.parent()?.next())
        this.sections['new_titles'].enabled = false
    }

    override supportsTagExclusion = true
}