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
import {
    createHomeSection,
    DefaultHomeSectionData
} from '../MangaStreamHelper'

const INFERNALVOIDSCANS_DOMAIN = 'https://void-scans.com'

export const InfernalVoidScansInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'InfernalVoidScans',
    description: 'Extension that pulls manga from InfernalVoidScans',
    author: 'nicknitewolf',
    authorWebsite: 'http://github.com/nicknitewolf',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: INFERNALVOIDSCANS_DOMAIN,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED | SourceIntents.SETTINGS_UI,
    sourceTags: [
        {
            text: 'Notifications',
            type: BadgeColor.GREEN
        }
    ]
}

export class InfernalVoidScans extends MangaStream {

    baseUrl: string = INFERNALVOIDSCANS_DOMAIN

    override configureSections() {
        this.sections['latest_update'].selectorFunc = ($: CheerioStatic) => $('div.uta', $('h2:contains(Project Update)')?.parent()?.next())
        this.sections['new_titles'].enabled = false
        this.sections['top_alltime'].enabled = false
        this.sections['top_monthly'].enabled = false
        this.sections['top_weekly'].enabled = false

        // @ts-ignore
        this.sections['project_updates'] = {
            ...DefaultHomeSectionData,
            section: createHomeSection('project_updates', 'Project Updates', true),
            selectorFunc: ($: CheerioStatic) => $('div.uta', $('h2:contains(Project Update)')?.parent()?.next()),
            titleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('a', element).attr('title'),
            subtitleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('li > span', element).first().text().trim(),
            getViewMoreItemsFunc: (page: string) => `projects/page/${page}`,
            sortIndex: 11,
        }
    }
}