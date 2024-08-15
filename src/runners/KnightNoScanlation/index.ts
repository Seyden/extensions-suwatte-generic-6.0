import { RunnerInfo, CatalogRating } from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../templates/Madara/Madara'

import {
    KnightNoScanlationParser
} from './KnightNoScanlationParser'

const DOMAIN = 'https://knightnoscanlation.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'KnightNoScanlation',
        version: getExportVersion('0.0'),
        name: 'KnightNoScanlation',
        thumbnail: 'KnightNoScanlation.png',
        rating: CatalogRating.MIXED,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override language = 'es_ES'

    override chapterEndpoint = 1

    override parser: KnightNoScanlationParser = new KnightNoScanlationParser()
}