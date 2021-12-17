/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { DateBoundary, DateFilter, DateIncrementType } from '../../../models/panel/Date';

export const none: DateFilter = { dateIncrementType: DateIncrementType.NONE };

export const today: DateFilter = { dateIncrementType: DateIncrementType.NOW };

export const pastDates: DateBoundary[] = [
    { display: 'In Past 24 Hours', start: { increment: -24, dateIncrementType: DateIncrementType.HOUR }, end: today },
    { display: 'In Past 48 Hours', start: { increment: -48, dateIncrementType: DateIncrementType.HOUR }, end: today },
    { display: 'In Past 72 Hours', start: { increment: -72, dateIncrementType: DateIncrementType.HOUR }, end: today },
    { display: 'In Past 7 Days', start: { increment: -7, dateIncrementType: DateIncrementType.DAY }, end: today },
    { display: 'In Past 30 Days', start: { increment: -30, dateIncrementType: DateIncrementType.DAY }, end: today },
    { display: 'In Past 6 Months', start: { increment: -6, dateIncrementType: DateIncrementType.MONTH }, end: today },
    { display: 'In Past 12 Months', start: { increment: -12, dateIncrementType: DateIncrementType.MONTH }, end: today },
    { display: 'In Past 2 Years', start: { increment: -2, dateIncrementType: DateIncrementType.YEAR }, end: today },
    { display: 'In Past 3 Years', start: { increment: -3, dateIncrementType: DateIncrementType.YEAR }, end: today }
];

export const futureDates: DateBoundary[] = [
    { display: 'In Next 10 Days', start: today, end: { increment: 10, dateIncrementType: DateIncrementType.DAY } },
    { display: 'In Next 30 Days', start: today, end: { increment: 30, dateIncrementType: DateIncrementType.DAY } },
    { display: 'In Next 6 Months', start: today, end: { increment: 6, dateIncrementType: DateIncrementType.MONTH } }
];