/* eslint-disable linebreak-style */
import {
    RunnerInfo,
    CatalogRating,
    NetworkRequest
} from '@suwatte/daisuke'

import {
    getExportVersion,
    MangaStream
} from '../../MangaStream'

const simpleUrl = require('simple-url')

import { AsuraScansParser } from './AsuraScansParser'

const ASURASCANS_DOMAIN = 'https://asura.gg'

export class Target extends MangaStream {

    info: RunnerInfo = {
        id: 'AsuraScans',
        version: getExportVersion('0.0'),
        name: 'AsuraScans',
        thumbnail: 'AsuraScans.png',
        rating: CatalogRating.MIXED,
        website: ASURASCANS_DOMAIN,
    }

    baseUrl: string = ASURASCANS_DOMAIN

    override readonly parser: AsuraScansParser = new AsuraScansParser()

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }

    override async interceptRequest(request: NetworkRequest): Promise<void> {
        const path: any = simpleUrl.parse(request.url, true)
        if (path.host.includes('asurascans')) {
            const overridePath: any = simpleUrl.parse(await this.getAndSetBaseUrl(), true)
            path.host = overridePath.host
            request.url = simpleUrl.create(path)
        }
    }

}