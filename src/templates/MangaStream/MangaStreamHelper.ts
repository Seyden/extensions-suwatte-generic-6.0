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

export function getFilterTagsBySection(tags: string[], included: boolean, supportsExclusion: boolean = false): string[] {
    if (!included && !supportsExclusion) {
        return []
    }

    return tags?.map((x: string) => {
        let id: string = x
        if (!included) {
            id = encodeURI(`-${id}`)
        }
        return id
    })
}

export function isImgLink(url: string) {
    return(url.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gmi) != null);
}