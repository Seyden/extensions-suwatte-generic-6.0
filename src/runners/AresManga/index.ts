import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../MangaStream'

const DOMAIN = 'https://en-aresmanga.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'AresManga',
        version: getExportVersion('0.0'),
        name: 'AresManga',
        thumbnail: 'AresManga.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }
    override baseUrl = DOMAIN
    override language = 'AR'
    override sourceTraversalPathName = 'series'
    override manga_selector_author = 'المؤلف'
    override manga_selector_artist = 'الرسام'
    override manga_selector_status = 'الحالة'

    //----DATE SETTINGS
    override dateMonths = {
        january: 'يناير',
        february: 'فبراير',
        march: 'مارس',
        april: 'أبريل',
        may: 'مايو',
        june: 'يونيو',
        july: 'يوليو',
        august: 'أغسطس',
        september: 'سبتمبر',
        october: 'أكتوبر',
        november: 'نوفمبر',
        december: 'ديسمبر'
    }

    override configureSections() {
        this.sections['new_titles'].enabled = false
        this.sections['popular_today'].enabled = false
        this.sections['top_alltime'].enabled = false
        this.sections['top_weekly'].enabled = false
        this.sections['top_monthly'].enabled = false
        this.sections['latest_update'].selectorFunc = ($: CheerioStatic) => $('div.bsx', $('h2:contains(جديد إصداراتنا)')?.parent()?.next())
    }
}