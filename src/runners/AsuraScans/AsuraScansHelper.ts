import {
    PageSection,
    SectionStyle,
    Tag
} from '@suwatte/daisuke'

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