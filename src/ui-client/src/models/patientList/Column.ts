/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListDatasetId } from './Dataset';

export type PatientListColumnId = string;
export type ValueByColumnKey = Map<PatientListColumnId, object>;

export enum PatientListColumnType {
    string = 1,
    date = 2,
    boolean = 3,
    guid = 4,
    number = 5,
    sparkline = 6,
}

export interface PatientListColumnTemplate {
    autoDisplayOnLoad?: boolean;
    displayName?: string;
    id: PatientListColumnId;
    optional?: boolean;
    type: PatientListColumnType;
}

export interface AdminPanelPatientListColumnTemplate extends PatientListColumnTemplate {
    present: boolean;
}

export interface PatientListColumn extends PatientListColumnTemplate {
    datasetId: PatientListDatasetId;
    index: number;
    isDisplayed: boolean;
}

export interface XY {
    x: Date;
    y: number;
}