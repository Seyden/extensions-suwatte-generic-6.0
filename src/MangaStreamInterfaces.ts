import { ExcludableMultiSelectProp } from '@suwatte/daisuke'

export interface Months {
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
}

export interface StatusTypes {
    ONGOING: string;
    COMPLETED: string;
    DROPPED: string;
}

export type FilterProps = {
    status?: string; // select
    type?: string; // select
    order?: string; // select
    chapters?: string; // select

    genres?: string[] | ExcludableMultiSelectProp;
};