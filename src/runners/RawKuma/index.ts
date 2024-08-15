/* eslint-disable linebreak-style */
import { RunnerInfo, CatalogRating } from "@suwatte/daisuke";

import {
    getExportVersion,
    MangaStream
} from '../../templates/MangaStream/MangaStream'

const RAWKUMA_DOMAIN = 'https://rawkuma.com'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'RawKuma',
        version: getExportVersion('0.0'),
        name: 'RawKuma',
        thumbnail: 'RawKuma.png',
        rating: CatalogRating.MIXED,
        website: RAWKUMA_DOMAIN,
    }

    baseUrl: string = RAWKUMA_DOMAIN
    override language: string = 'ja_JP'

}