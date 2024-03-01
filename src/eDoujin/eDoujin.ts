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

const EDOUJIN_DOMAIN = 'https://edoujin.net'

export const eDoujinInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'eDoujin',
    description: 'Extension that pulls manga from eDoujin',
    author: 'Seyden',
    authorWebsite: 'https://github.com/Seyden',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: EDOUJIN_DOMAIN,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED | SourceIntents.SETTINGS_UI,
    sourceTags: [
        {
            text: '18+',
            type: BadgeColor.YELLOW
        }
    ]
}

export class eDoujin extends MangaStream {

    baseUrl: string = EDOUJIN_DOMAIN

    override configureSections() {
        this.sections['latest_update'].enabled = false
        this.sections['new_titles'].enabled = false
    }
}