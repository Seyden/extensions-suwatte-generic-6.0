import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

import { MangaLekParser } from './MangaLekParser'

const DOMAIN = 'https://mangaleku.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'MangaLek',
        version: getExportVersion('0.0'),
        name: 'MangaLek',
        thumbnail: 'MangaLek.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
        
    }

    baseUrl: string = DOMAIN

    override language = 'ar_AE'

    override chapterEndpoint = 1

    override bypassPage = `${DOMAIN}/?s=&post_type=wp-manga`

    override parser: MangaLekParser = new MangaLekParser()
}