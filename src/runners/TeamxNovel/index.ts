import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../MangaStream'

const DOMAIN = 'https://team11x11.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'TeamxNovel',
        version: getExportVersion('0.0'),
        name: 'TeamxNovel',
        thumbnail: 'TeamxNovel.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

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