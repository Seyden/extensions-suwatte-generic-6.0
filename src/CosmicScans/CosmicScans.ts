/* eslint-disable linebreak-style */
import {
    BadgeColor,
    ContentRating,
    Response,
    SourceInfo,
    SourceIntents
} from '@paperback/types'

import {
    getExportVersion,
    MangaStream
} from '../MangaStream'

const COSMICSCANS_DOMAIN = 'https://cosmicscans.com'

export const CosmicScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'CosmicScans',
    description: 'Extension that pulls manga from CosmicScans',
    author: 'Seyden',
    authorWebsite: 'https://github.com/Seyden',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: COSMICSCANS_DOMAIN,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
    sourceTags: [
        {
            text: 'Notifications',
            type: BadgeColor.GREEN
        }
    ]
}

export class CosmicScans extends MangaStream {

    baseUrl: string = COSMICSCANS_DOMAIN

    override usePostIds = false

    override configureSections() {
        this.sections['new_titles']!.enabled = false
    }
}