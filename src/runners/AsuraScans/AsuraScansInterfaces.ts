export interface StatusTypes {
    ONGOING: string;
    HIATUS: string;
    COMPLETED: string;
    DROPPED: string;
    SEASONEND: string;
    COMINGSOON: string;
}

export type FilterProps = {
    status?: string; // select
    type?: string; // select
    order?: string; // select
    chapters?: string; // select

    genres?: string[];
};