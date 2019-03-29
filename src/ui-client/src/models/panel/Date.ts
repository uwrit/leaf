/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export interface DateBoundary {
    display?: string;
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