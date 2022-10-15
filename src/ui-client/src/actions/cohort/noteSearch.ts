import { PatientListDatasetQuery } from "../../models/patientList/Dataset";
import { DateBoundary } from "../../models/panel/Date";

/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const SET_NOTE_DATASETS = 'SET_NOTE_DATASETS';
export const SET_NOTE_DATASET_CHECKED = 'SET_NOTE_DATASET_CHECKED';
export const SET_NOTE_SEARCH_DATERANGE = 'SET_NOTE_SEARCH_DATERANGE';

export interface NoteSearchAction {
    datasetId?: string;
    datasets?: PatientListDatasetQuery[];
    dateFilter?: DateBoundary;
    id: number;
    type: string;
}

export const setNoteDatasets = (datasets: PatientListDatasetQuery[]): NoteSearchAction => {
    return {
        datasets,
        id: -1,
        type: SET_NOTE_DATASETS
    };
};

export const setNoteDatasetChecked = (datasetId: string): NoteSearchAction => {
    return {
        datasetId,
        id: -1,
        type: SET_NOTE_DATASET_CHECKED
    };
};


export const setNoteSearchDateRange = (dateFilter: DateBoundary): NoteSearchAction => {
    return {
        dateFilter,
        id: -1,
        type: SET_NOTE_DATASET_CHECKED
    };
};
