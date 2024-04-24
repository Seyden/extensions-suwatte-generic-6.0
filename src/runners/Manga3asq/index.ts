import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

import { Manga3asqParser } from './Manga3asqParser'

const DOMAIN = 'https://3asq.org'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'Manga3asq',
        version: getExportVersion('0.0'),
        name: 'Manga3asq',
        thumbnail: 'Manga3asq.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
        
    }

    baseUrl: string = DOMAIN

    override language = 'ar_AE'

    override chapterEndpoint = 1

    override parser: Manga3asqParser = new Manga3asqParser()
}