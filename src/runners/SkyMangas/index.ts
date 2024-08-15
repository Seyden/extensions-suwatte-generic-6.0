/* eslint-disable linebreak-style */
import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'
import { SkyMangasParser } from './SkyMangasParser'

const SKYMANGAS_DOMAIN = 'https://skymangas.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'SkyMangas',
        version: getExportVersion('0.0'),
        name: 'SkyMangas',
        thumbnail: 'SkyMangas.png',
        rating: CatalogRating.MIXED,
        website: SKYMANGAS_DOMAIN,
    }

    baseUrl: string = SKYMANGAS_DOMAIN
    override language: string = 'es_ES'

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