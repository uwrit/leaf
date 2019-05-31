/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatasetsState } from "../models/state/AppState";
import { DatasetAction, SET_PATIENTLIST_DATASETS, SET_PATIENTLIST_DATASET_BY_INDEX, SET_DATASET_SEARCH_TERM, SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT, REMOVE_PATIENTLIST_DATASET } from "../actions/datasets";

export const defaultDatasetsState = (): DatasetsState => {
    return {
        available: [],
        unfilteredAvailableCount: 0,
        searchTerm: ''
    };
};

const setPatientListDatasets = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    return Object.assign({}, state, {
        available: action.datasets
    });
};

const setPatientListDatasetByIndex = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const available = state.available.slice();
    const newDs = Object.assign({}, available[action.datasetCategoryIndex!].datasets[action.datasetIndex!], action.dataset);
    available[action.datasetCategoryIndex!].datasets[action.datasetIndex!] = newDs;

    return Object.assign({}, state, {
        available
    });
};

const removePatientListDatasetByIndex = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    const available = state.available.slice();
    available[action.datasetCategoryIndex!].datasets.splice(action.datasetIndex!,1);

    return Object.assign({}, state, {
        available
    });
};

const setPatientListDatasetSearchTerm = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    return Object.assign({}, state, {
        searchTerm: action.searchTerm
    });
};

const setPatientListDatasetTotalAvailable = (state: DatasetsState, action: DatasetAction): DatasetsState => {
    return Object.assign({}, state, {
        unfilteredAvailableCount: action.datasetsAvailableCount
    });
};

export const datasets = (state: DatasetsState = defaultDatasetsState(), action: DatasetAction): DatasetsState => {

    switch (action.type) {
        case SET_PATIENTLIST_DATASETS:
            return setPatientListDatasets(state, action!);
        case SET_PATIENTLIST_DATASET_BY_INDEX:
            return setPatientListDatasetByIndex(state, action);
        case SET_DATASET_SEARCH_TERM:
            return setPatientListDatasetSearchTerm(state, action!);
        case SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT:
            return setPatientListDatasetTotalAvailable(state, action!);
        case REMOVE_PATIENTLIST_DATASET:
            return removePatientListDatasetByIndex(state, action);
        default:
            return state;
    }
};