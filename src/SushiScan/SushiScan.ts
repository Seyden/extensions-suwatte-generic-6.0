/* eslint-disable linebreak-style */
import {
    BadgeColor,
    ContentRating,
    SourceInfo,
    SourceIntents
} from '@paperback/types'

import {
    getExportVersion,
    MangaStream
} from '../MangaStream'

const SUSHI_SCAN_DOMAIN = 'https://sushiscan.net'

export const SushiScanInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'Sushi Scan',
    description: 'Extension that pulls manga from sushiscan.su',
    author: 'btylerh7',
    authorWebsite: 'http://github.com/btylerh7',
    icon: 'logo.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: SUSHI_SCAN_DOMAIN,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED | SourceIntents.SETTINGS_UI,
    sourceTags: [
        {
            text: 'Notifications',
            type: BadgeColor.GREEN
        },
        {
            text: 'French',
            type: BadgeColor.GREY
        }
    ]
}

export class SushiScan extends MangaStream {
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