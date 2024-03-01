import {
    ContentRating,
    SourceInfo,
    SourceIntents
} from '@paperback/types'

import {
    getExportVersion,
    MangaStream
} from '../MangaStream'

const DOMAIN = 'https://anigliscans.xyz'

export const AnigliScansInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'AnigliScans',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Seyden',
    authorWebsite: 'https://github.com/Seyden',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: DOMAIN,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED | SourceIntents.SETTINGS_UI,
    sourceTags: []
}

export class AnigliScans extends MangaStream {

    baseUrl: string = DOMAIN

    override sourceTraversalPathName = 'series'

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }
}