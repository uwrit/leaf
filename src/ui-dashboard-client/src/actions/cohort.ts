/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { CohortData, CohortStateType } from '../models/state/CohortState';
import { DemographicRow } from '../models/cohortData/DemographicDTO';
import { AppState } from '../models/state/AppState';
import { fetchAvailableDatasets, fetchDataset, fetchDemographics } from '../services/cohortApi';
import { transform } from '../services/cohortDataApi';
import { getDependentDatasets } from '../utils/dynamic';

export const SET_COHORT_DATASETS = 'SET_COHORT_DATASETS';
export const SET_COHORT_STATE = 'SET_COHORT_STATE';

export interface CohortAction {
    cohort?: CohortData;
    id?: string;
    state?: CohortStateType;
    message?: string;
    type: string;
}

// Asynchronous
export const getCohortDatasets = (cohortId: string) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        dispatch(setCohortState(CohortStateType.REQUESTING));

        const datasetIds = getDependentDatasets(state.config.patient.content);

        // Get metadata on all datasets
        const availableDTO = await fetchAvailableDatasets(state);
        const available = new Map(availableDTO.map(ds => [ds.id, ds]));
        const dtos: any = [];

        // Demographics
        const demogResp = await fetchDemographics(state, cohortId!);
        const demographics = (demogResp.data as any).patients as DemographicRow[];

        // Loop through each dataset, request data
        for (const id of datasetIds) {
            const ref = available.get(id);
            if (ref) {
                const dataDTO = await fetchDataset(state, cohortId!, id, ref.shape);
                dtos.push([ ref, dataDTO ]);
            }
        }

        // Clean & transform
        const transformed = await transform(dtos, demographics);
        console.log(transformed);
        dispatch(setCohortDataset(transformed));
        dispatch(setCohortState(CohortStateType.LOADED));
    };
};

// Synchronous
export const setCohortDataset = (cohort: CohortData): CohortAction => {
    return {
        cohort,
        type: SET_COHORT_DATASETS
    };
};

export const setCohortState = (state: CohortStateType): CohortAction => {
    return {
        state,
        type: SET_COHORT_STATE
    };
};

