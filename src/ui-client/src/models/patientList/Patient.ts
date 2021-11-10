/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { MultirowDataByDatasetKey, SingletonDataByDatasetKey } from './Dataset';

export type PatientId = string;
export type EncounterId = string;

// Model stored in the web worker backend
export interface Patient {
    compoundId: PatientId;
    detailRowCount: number;
    detailValues: PatientListDetailEncounter[];
    id: string;
    responderId: number;
    singletonData: SingletonDataByDatasetKey;
    multirowData: MultirowDataByDatasetKey;
}

// This is an instantiated row shown on the patient list
export interface PatientListRow {
    compoundId: PatientId;
    detailRowCount: number;
    detailValues: PatientListDetailEncounter[];
    isOpen: boolean;
    responderId: number;
    values: any[];
}

export interface PatientListRowDTO {
    [key: string]: string;
    encounterId?: EncounterId;
    personId: string;
}

export interface PatientListDetailEncounter {
    encounterId: EncounterId;
    rows: PatientListDetailEncounterRow[];
}

export interface PatientListDetailEncounterRow {
    date: Date;
    dateColumnName: string;
    datasetName: string;
    columns: PatientListDetailEncounterKeyValue[];
    encounterId: EncounterId;
}

export interface PatientListDetailEncounterKeyValue {
    key: string;
    value: any;
}