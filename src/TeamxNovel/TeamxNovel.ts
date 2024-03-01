import {
    ContentRating,
    SourceInfo,
    SourceIntents
} from '@paperback/types'

import {
    getExportVersion,
    MangaStream
} from '../MangaStream'

const DOMAIN = 'https://team11x11.com'

export const TeamxNovelInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'TeamxNovel',
    description: `Extension that pulls manga from ${DOMAIN}`,
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: DOMAIN,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED | SourceIntents.SETTINGS_UI,
    sourceTags: []
}

export class TeamxNovel extends MangaStream {

    baseUrl: string = DOMAIN

    override sourceTraversalPathName = 'series'

    override configureSections() {
        this.sections['new_titles'].enabled = false
        this.sections['top_monthly'].enabled = false
        this.sections['top_weekly'].enabled = false
        this.sections['top_alltime'].enabled = false
        this.sections['popular_today'].enabled = false
        this.sections['latest_update'].selectorFunc = ($: CheerioStatic) => $('div.uta', $('h1:contains(اخر الفصول)')?.parent()?.parent())
        this.sections['latest_update'].titleSelectorFunc = ($: CheerioStatic, element: CheerioElement) => $('h3', element).text().trim()
        this.sections['latest_update'].subtitleSelectorFunc = ($: CheerioStatic, element: CheerioElement) => $('li > a', element).first().text().trim()

    }
}