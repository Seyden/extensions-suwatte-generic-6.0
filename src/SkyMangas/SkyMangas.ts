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
import { SkyMangasParser } from './SkyMangasParser'

const SKYMANGAS_DOMAIN = 'https://skymangas.com'

export const SkyMangasInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'SkyMangas',
    description: 'Extension that pulls manga from SkyMangas',
    author: 'Seyden',
    authorWebsite: 'https://github.com/Seyden',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: SKYMANGAS_DOMAIN,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED | SourceIntents.SETTINGS_UI,
    sourceTags: [
        {
            text: 'Notifications',
            type: BadgeColor.GREEN
        },
        {
            text: 'Spanish',
            type: BadgeColor.GREY
        }
    ]
}

export class SkyMangas extends MangaStream {

    baseUrl: string = SKYMANGAS_DOMAIN
    override language: string = '🇪🇸'

    override parser = new SkyMangasParser()

    override configureSections() {
        this.sections['popular_today'].selectorFunc = ($: CheerioStatic) => $('div.bsx', $('h2:contains(Popular Today)')?.parent()?.next())
        this.sections['latest_update'].selectorFunc = ($: CheerioStatic) => $('div.uta', $('h2:contains(Latest Update)')?.parent()?.next())
        this.sections['new_titles'].enabled = false
        this.sections['top_alltime'].enabled = false
        this.sections['top_monthly'].enabled = false
        this.sections['top_weekly'].enabled = false
    }
}