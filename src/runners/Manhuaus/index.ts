import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

const DOMAIN = 'https://manhuaus.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'Manhuaus',
        version: getExportVersion('0.0'),
        name: 'Manhuaus',
        thumbnail: 'Manhuaus.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override chapterDetailsSelector = 'li.blocks-gallery-item > figure > img, div.page-break > img, div#chapter-video-frame > p > img, div.text-left > figure.wp-block-gallery > figure.wp-block-image > img, div.text-left > p > img'

    override bypassPage = `${DOMAIN}/?p`
}