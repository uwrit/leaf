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
import { getComparisonMeans, transform } from '../services/cohortDataApi';
import { getDependentDatasets } from '../utils/dynamic';
import { indexPatients, searchPatients } from '../services/patientSearchApi';
import { fetchDashboardConfigurations } from '../services/configApi';
import { setDashboardConfig } from './config';
import { config }from '../test/mock';
import { setProgressModal } from './session';
import { WidgetTimelineComparisonEntryConfig } from '../models/config/content';
import { TimelineValueSet } from '../components/Dynamic/Timeline/Timeline';

export const SET_COHORT_DATASETS = 'SET_COHORT_DATASETS';
export const SET_COMPARISON_DATASET = 'SET_COMPARISON_DATASET';
export const SET_COHORT_STATE = 'SET_COHORT_STATE';
export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';
export const SET_SEARCH_HINTS = 'SET_SEARCH_HINTS';

export interface CohortAction {
    cohort?: CohortData;
    comparison?: Map<string, number>;
    hints?: DemographicRow[];
    id?: string;
    state?: CohortStateType;
    term?: string;
    message?: string;
    type: string;
}

// Asynchronous
export const getCohortDatasets = (cohortId: string) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        let percent = 0.0;
        const state = getState();
        const updateProgress = (show: boolean = true) => {
            dispatch(setProgressModal({ message: `Loading Data (${Math.round(percent * 100)}%)`, percent, show }))
        };

        dispatch(setCohortState(CohortStateType.REQUESTING));
        updateProgress();

        // Get available dashboard configs
        const configs = await fetchDashboardConfigurations(state);
        if (configs.length) {
            //dispatch(setDashboardConfig(config));
            console.log(JSON.stringify(config));
            
            dispatch(setDashboardConfig(configs[0]));
            console.log(JSON.stringify(configs[0]));
            
        }

        const datasetIds = getDependentDatasets(getState().config.patient.content);

        // Get metadata on all datasets
        const availableDTO = await fetchAvailableDatasets(state);
        const available = new Map(availableDTO.map(ds => [ds.id, ds]));
        const dtos: any = [];

        // Demographics
        const demogResp = await fetchDemographics(state, cohortId!);
        const demographics = (demogResp.data as any).patients as DemographicRow[];

        // Loop through each dataset, request data
        
        for (let i = 0; i < datasetIds.length; i++) {
            const id = datasetIds[i];
            const ref = available.get(id);
            if (ref) {
                const dataDTO = await fetchDataset(state, cohortId!, id, ref.shape);
                dtos.push([ ref, dataDTO ]);
            }
            percent = (i+1) / datasetIds.length;
            updateProgress();
        }

        // Index patients for search
        await indexPatients(demographics);

        // Clean & transform
        const transformed = await transform(dtos, demographics);
        dispatch(setCohortDataset(transformed));
        dispatch(setCohortState(CohortStateType.LOADED));
        updateProgress(false);
    };
};

export const getTimelineComparisonValues = (
    filters: WidgetTimelineComparisonEntryConfig[], 
    dimensions: TimelineValueSet[],
    sourcePatId: string) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const comparison = await getComparisonMeans(filters, dimensions, sourcePatId);
        dispatch(setComparisonDataset(comparison));
        console.log(comparison);
    }
};

export const searchForPatients = (term: string, top?: number) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        dispatch(setSearchTerm(term));
        const hints = await searchPatients(term, top);
        dispatch(setSearchHints(hints));
    }
};

// Synchronous
export const setCohortDataset = (cohort: CohortData): CohortAction => {
    return {
        cohort,
        type: SET_COHORT_DATASETS
    };
};

export const setComparisonDataset = (comparison: Map<string, number>): CohortAction => {
    return {
        comparison,
        type: SET_COMPARISON_DATASET
    };
};

export const setCohortState = (state: CohortStateType): CohortAction => {
    return {
        state,
        type: SET_COHORT_STATE
    };
};

export const setSearchTerm = (term: string): CohortAction => {
    return {
        term,
        type: SET_SEARCH_TERM
    };
};

export const setSearchHints = (hints: DemographicRow[]): CohortAction => {
    return {
        hints,
        type: SET_SEARCH_HINTS
    };
};


