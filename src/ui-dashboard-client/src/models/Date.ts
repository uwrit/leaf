export interface DateBoundary {
    display?: string;
    abbrev?: string;
    start: DateFilter;
    end: DateFilter;
}

export interface DateFilter {
    date?: Date;
    increment?: number;
    dateIncrementType: DateIncrementType;
}

export enum DateType { DAY, HOUR, MINUTE, MONTH, WEEK, YEAR };
export enum DateIncrementType { NONE, NOW, DAY, HOUR, MINUTE, MONTH, WEEK, YEAR, SPECIFIC };