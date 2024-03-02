/* eslint-disable linebreak-style */
import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../MangaStream'

const SUSHI_SCAN_DOMAIN = 'https://sushiscan.net'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'Sushi Scan',
        version: getExportVersion('0.0'),
        name: 'Sushi Scan',
        thumbnail: 'SushiScan.png',
        rating: CatalogRating.SAFE,
        website: SUSHI_SCAN_DOMAIN,
    }
    baseUrl: string = SUSHI_SCAN_DOMAIN
    override language: string = '🇫🇷'

    override sourceTraversalPathName = 'catalogue'

    override manga_tag_selector_box = 'div.seriestugenre'

    override manga_selector_artist = 'Dessinateur'
    override manga_selector_author = 'Auteur'
    override manga_selector_status = 'Statut'

    override manga_StatusTypes = {
        ONGOING: 'En Cours',
        COMPLETED: 'Terminé',
        DROPPED: 'Abandonné'
    }

    // ----DATE SELECTORS----
    /**
     * Enter the months for the website's language in correct order, case insensitive.
     * Default = English Translation
     */
    override dateMonths = {
        january: 'janvier',
        february: 'février',
        march: 'mars',
        april: 'avril',
        may: 'mai',
        june: 'juin',
        july: 'juillet',
        august: 'août',
        september: 'septembre',
        october: 'octobre',
        november: 'novembre',
        december: 'décembre'
    }

    override configureSections() {
        this.sections['popular_today'].selectorFunc = ($: CheerioStatic) => $('div.bsx', $('h2:contains(Populaire Aujourd\'hui)')?.parent()?.next())
        this.sections['latest_update'].selectorFunc = ($: CheerioStatic) => $('div.bsx', $('h2:contains(Dernières Sorties)')?.parent()?.next())
        this.sections['new_titles'].enabled = false
    }
}