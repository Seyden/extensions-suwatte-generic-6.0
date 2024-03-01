import {
    RunnerInfo,
    CatalogRating,
    SectionStyle,
    PagedResult,
    Highlight,
    PageSection,
    PageLink,
    DirectoryRequest
} from '@suwatte/daisuke'

import {
    getExportVersion,
    Madara
} from '../../Madara'

import { load } from "cheerio";

const DOMAIN = 'https://manhuaplus.com'

export class Target extends Madara {

    info: RunnerInfo = {
        id: 'ManhuaPlus',
        version: getExportVersion('0.0'),
        name: 'ManhuaPlus',
        thumbnail: 'ManhuaPlus.png',
        rating: CatalogRating.SAFE,
        website: DOMAIN,
    }

    baseUrl: string = DOMAIN

    override chapterEndpoint = 1

    override chapterDetailsSelector = 'li.blocks-gallery-item > figure > img, div.page-break > img, div#chapter-video-frame > p > img, div.text-left > p > img'

    override async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
        if (link.id !== "home")
            throw new Error("Accessing invalid page")

        const sections: { request: any, section: PageSection }[] = [
            {
                request: {
                    url: `${this.baseUrl}/${this.directoryPath}/?m_orderby=latest`,
                    method: 'GET'
                },
                section: {
                    id: '0',
                    title: 'Recently Updated',
                    style: SectionStyle.DEFAULT,
                    viewMoreLink: { request: { page: 1, listId: "0" } }
                }
            },
            {
                request: {
                    url: `${this.baseUrl}/${this.directoryPath}/?m_orderby=trending`,
                    method: 'GET'
                },
                section: {
                    id: '1',
                    title: 'Currently Trending',
                    style: SectionStyle.DEFAULT,
                    viewMoreLink: { request: { page: 1, listId: "1" } }
                }
            },
            {
                request: {
                    url: `${this.baseUrl}/${this.directoryPath}/?m_orderby=views`,
                    method: 'GET'
                },
                section: {
                    id: '2',
                    title: 'Most Popular',
                    style: SectionStyle.DEFAULT,
                    viewMoreLink: { request: { page: 1, listId: "2" } }
                }
            },
            {
                request: {
                    url: `${this.baseUrl}/${this.directoryPath}/?m_orderby=new-manga`,
                    method: 'GET'
                },
                section: {
                    id: '3',
                    title: 'New Manga',
                    style: SectionStyle.DEFAULT,
                    viewMoreLink: { request: { page: 1, listId: "3" } }
                }
            }
        ]

        const promises: Promise<PageSection>[] = []
        for (const section of sections) {
            // Get the section data
            promises.push(
                this.client.request(section.request).then(async response => {
                    this.checkResponseError(response)
                    const $ = load(response.data as string)
                    section.section.items = await this.parser.parseHomeSection($, this)
                    return section.section
                })
            )

        }

        // Make sure the function completes
        return await Promise.all(promises)
    }

    override async getViewMoreItems(searchRequest: DirectoryRequest): Promise<PagedResult> {
        const page = searchRequest?.page ?? 1
        let param: string

        switch (searchRequest.listId) {
            case '0': {
                param = 'm_orderby=latest'
                break
            }
            case '1': {
                param = 'm_orderby=trending'
                break
            }
            case '2': {
                param = 'm_orderby=views'
                break
            }
            case '3': {
                param = 'm_orderby=new-manga'
                break
            }
            default:
                throw new Error(`Invalid homeSectionId | ${searchRequest.listId}`)
        }

        const request = {
            url: `${this.baseUrl}/${this.directoryPath}/page/${page}/?${param}`,
            method: 'GET'
        }

        const response = await this.client.request(request)
        this.checkResponseError(response)
        const $ = load(response.data as string)
        const items: Highlight[] = await this.parser.parseHomeSection($, this)

        return {
            results: items,
            isLastPage: !$('a.last')
        }
    }

}