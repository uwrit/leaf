/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { CohortState } from '../models/state/CohortState';
import { DemographicRow } from '../models/cohortData/DemographicDTO';
import { AppState } from '../models/state/AppState';
import { fetchAvailableDatasets, fetchDataset, fetchDemographics } from '../services/cohortApi';
import { transform } from '../services/cohortDataApi';

export const SET_COHORT_DATASETS = 'SET_COHORT_DATASETS';

export interface CohortAction {
    cohort?: CohortState;
    id?: string;
    message?: string;
    type: string;
}

// Asynchronous
export const getCohortDatasets = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        const { cohortId, datasetIds } = state.config.main;

        // Get metadata on all datasets
        const availableDTO = await fetchAvailableDatasets(state);
        const available = new Map(availableDTO.map(ds => [ds.id, ds]));
        const dtos: any = [];

        // Demographics
        const demogResp = await fetchDemographics(state, cohortId);
        const demographics = (demogResp.data as any).patients as DemographicRow[];

        // Loop through each dataset, request data
        for (const id of datasetIds) {
            const ref = available.get(id);
            if (ref) {
                const dataDTO = await fetchDataset(state, cohortId, id, ref.shape);
                console.log(ref, dataDTO);
                dtos.push([ ref, dataDTO ]);
            }
        }

        // Clean & transform
        const transformed = await transform(dtos, demographics);
        console.log(transformed);
        dispatch(setCohortDataset(transformed))
    };
};

// Synchronous
export const setCohortDataset = (cohort: CohortState): CohortAction => {
    return {
        cohort,
        type: SET_COHORT_DATASETS
    };
};