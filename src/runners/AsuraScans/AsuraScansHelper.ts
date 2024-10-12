import {
    NetworkRequest,
    NetworkResponse,
    PageSection,
    SectionStyle,
    Tag
} from '@suwatte/daisuke'
import { load } from 'cheerio'

export interface HomeSectionData {
    selectorFunc: Function
    titleSelectorFunc: Function
    subtitleSelectorFunc: Function
    getViewMoreItemsFunc: Function
    section: PageSection
    enabled: boolean
    sortIndex: number
}

export const DefaultHomeSectionData = {
    titleSelectorFunc: ($: CheerioStatic, element: CheerioElement) => $('h2', element).text().trim(),
    subtitleSelectorFunc: () => undefined,
    getViewMoreItemsFunc: () => undefined,
    enabled: true
}

export function createHomeSection(id: string, title: string, containsMoreItems: boolean = true, style: SectionStyle = SectionStyle.DEFAULT): PageSection {
    return {
        id,
        title,
        style,
        viewMoreLink: containsMoreItems ? { request: { page: 1, listId: id, configID: id } } : undefined,
    }
}

export function getSelectValue(filterValue: string | undefined): any {
    return filterValue?.replace(' ', '+')
}

export function getIncludedTagBySection(section: string, tags: Tag[]): any {
    return (tags?.find((x: Tag) => x.id.startsWith(`${section}:`))?.id.replace(`${section}:`, '') ?? '').replace(' ', '+')
}

export function getFilterTagsBySection(section: string, tags: Tag[]): string[] {
    return tags?.filter((x: Tag) => x.id.startsWith(`${section}:`)).map((x: Tag) => {
        return x.id.replace(`${section}:`, '')
    })
}

export function isImgLink(url: string) {
    return(url.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gmi) != null);
}

export function extractMangaData(text: string, node: string) {

    const startIndex = text.indexOf(`\"${node}\":`);
    if (startIndex === -1) return null;

    let openBraces = 0;
    let closeBraces = 0;
    let insideStringLiteral = false;
    let endIndex = startIndex;

    for (let i = startIndex; i < text.length; i++) {
        if (text[i] === '"' && text[i-1] !== '\\') insideStringLiteral = !insideStringLiteral

        if (!insideStringLiteral) {
            if (text[i] === '{' || text[i] === '[') {
                openBraces++;
            }
            if (text[i] === '}' || text[i] === ']') {
                closeBraces++;
            }
        }

        if (openBraces > 0 && openBraces === closeBraces) {
            endIndex = i + 1;
            break;
        }
    }

    const finalText = text.substring(startIndex, endIndex)
    if (!finalText) {
        return ''
    }

    return `{${finalText}}`;
}

export async function getMangaSlug(mangaId: string): Promise<string | null> {
    return await ObjectStore.string(`${mangaId}:slug`)
}

export async function setMangaSlug(mangaId: string, link: string): Promise<void> {
    await ObjectStore.set(`${mangaId}:slug`, link)
}

export async function loadRequestData(client: NetworkClient, url: string, method: string = 'GET'): Promise<string> {
    const request: NetworkRequest = {
        url,
        method,
        validateStatus: s => s == 404 || s == 403 || s == 503 || (s >= 200 && s < 300)
    }

    const response = await client.request(request)
    checkResponseErrors(response)
    return response.data as string
}

export async function loadCheerioData(client: NetworkClient, url: string, method: string = 'GET'): Promise<CheerioStatic> {
    return load(await loadRequestData(client, url, method), { _useHtmlParser2: true })
}

export function checkResponseErrors(response: NetworkResponse): void {
    const status = response.status
    switch (status) {
    case 403:
    case 503:
        throw new CloudflareError(response.request.url)
    case 404:
        throw new Error(`The requested page ${response.request.url} was not found!`)
    }
}