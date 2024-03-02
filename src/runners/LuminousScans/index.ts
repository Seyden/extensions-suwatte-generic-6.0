/* eslint-disable linebreak-style */
import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../MangaStream'

const LUMINOUSSCANS_DOMAIN = 'https://lumitoon.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'LuminousScans',
        version: getExportVersion('0.0'),
        name: 'LuminousScans',
        thumbnail: 'LuminousScans.png',
        rating: CatalogRating.MIXED,
        website: LUMINOUSSCANS_DOMAIN,
    }

    baseUrl: string = LUMINOUSSCANS_DOMAIN

    override sourceTraversalPathName = 'series'
    override usePostIds = false

    override configureSections() {
        this.sections['new_titles'].enabled = false
    }
}