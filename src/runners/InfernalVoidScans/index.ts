/* eslint-disable linebreak-style */
import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../MangaStream'
import {
    createHomeSection,
    DefaultHomeSectionData
} from '../../MangaStreamHelper'

const INFERNALVOIDSCANS_DOMAIN = 'https://void-scans.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'InfernalVoidScans',
        version: getExportVersion('0.0'),
        name: 'InfernalVoidScans',
        thumbnail: 'InfernalVoidScans.png',
        rating: CatalogRating.MIXED,
        website: INFERNALVOIDSCANS_DOMAIN,
    }

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