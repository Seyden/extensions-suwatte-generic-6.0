import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

import {
    MangaReadOrgParser
} from './MangaReadOrgParser'

const DOMAIN = 'https://www.mangaread.org'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'MangaReadOrg',
        version: getExportVersion('0.0'),
        name: 'MangaReadOrg',
        thumbnail: 'MangaReadOrg.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override parser: MangaReadOrgParser = new MangaReadOrgParser()
}