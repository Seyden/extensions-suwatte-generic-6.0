/* eslint-disable linebreak-style */
import {
    ContentRating,
    Request,
    SourceInfo,
    SourceIntents
} from '@paperback/types'

import {
    getExportVersion,
    MangaStream
} from '../MangaStream'

const simpleUrl = require('simple-url')

import { AsuraScansParser } from './AsuraScansParser'

const ASURASCANS_DOMAIN = 'https://asura.gg'

export const AsuraScansInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'AsuraScans',
    description: 'Extension that pulls manga from AsuraScans',
    author: 'Seyden',
    authorWebsite: 'https://github.com/Seyden',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: ASURASCANS_DOMAIN,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED | SourceIntents.SETTINGS_UI,
    sourceTags: []
}

export class AsuraScans extends MangaStream {

    baseUrl: string = ASURASCANS_DOMAIN

    override readonly parser: AsuraScansParser = new AsuraScansParser()

    override configureSections(): void {
        this.sections['new_titles'].enabled = false
    }

    override async interceptRequest(request: Request): Promise<void> {
        const path: any = simpleUrl.parse(request.url, true)
        if (path.host.includes('asurascans')) {
            const overridePath: any = simpleUrl.parse(await this.getAndSetBaseUrl(), true)
            path.host = overridePath.host
            request.url = simpleUrl.create(path)
        }
    }

}