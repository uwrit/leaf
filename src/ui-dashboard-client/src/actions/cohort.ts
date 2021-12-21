/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { PatientListDatasetDTO } from '../models/patientList/Dataset';
import { AppState } from '../models/state/AppState';
import { fetchDataset } from '../services/cohortApi';

export const SET_COHORT_DATASET = 'SET_COHORT_DATASET';

export interface CohortAction {
    data?: PatientListDatasetDTO;
    id?: string;
    message?: string;
    type: string;
}

// Asynchronous
export const getCohortDatasets = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        const cohortId = state.config.main.cohortId;
        const datasets = state.config.main.datasets;

        for (const dataset of datasets) {
            const data = await fetchDataset(state, cohortId, dataset);
            console.log(data);
        }
    };
};

// Synchronous
export const setCohortDataset = (id: string, data: PatientListDatasetDTO): CohortAction => {
    return {
        id,
        data,
        type: SET_COHORT_DATASET
    };
};