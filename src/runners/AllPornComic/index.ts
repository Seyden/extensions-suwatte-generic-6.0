import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    Madara
} from '../../Madara'

const DOMAIN = 'https://allporncomic.com'
export class Target extends Madara {

    info: RunnerInfo = {
        id: 'AllPornComic',
        version: getExportVersion('0.0'),
        name: 'AllPornComic',
        thumbnail: 'AllPornComic.png',
        rating: CatalogRating.NSFW,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1
}