/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListDatasetQuery, DatasetSearchResult, CategorizedDatasetRef } from "../models/patientList/Dataset";
import { AppState } from "../models/state/AppState";
import { Dispatch } from "redux";
import { searchDatasets, allowAllDatasets, setAdminMode } from "../services/datasetSearchApi";

export const SET_DATASET = 'SET_DATASET';
export const SET_DATASET_SELECTED = 'SET_DATASET_SELECTED';
export const SET_DATASET_DISPLAY = 'SET_DATASET_DISPLAY';
export const SET_DATASETS = 'SET_DATASETS';
export const SET_DATASETS_SEARCH_TERM = 'SET_DATASET_SEARCH_TERM';
export const SET_DATASETS_SEARCH_RESULT = 'SET_DATASET_SEARCH_RESULT';
export const SWITCH_DATASET_OLD_FOR_NEW = 'SWITCH_DATASET_OLD_FOR_NEW';
export const REMOVE_DATASET = 'REMOVE_DATASET';
export const ADD_DATASET = 'ADD_DATASET';
export const MOVE_DATASET_CATEGORY = 'MOVE_DATASET_CATEGORY';

export interface DatasetAction {
    category?: string;
    categories?: Map<string, CategorizedDatasetRef>;
    datasetsAvailableCount?: number;
    dataset?: PatientListDatasetQuery;
    datasets?: PatientListDatasetQuery[];
    newDataset?: PatientListDatasetQuery;
    result?: DatasetSearchResult;
    searchTerm?: string;
    type: string;
}

// Asynchronous
export const searchPatientListDatasets = (searchTerm: string) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const results = await searchDatasets(searchTerm);
        dispatch(setDatasetSearchResult(results));
    };
};

export const resetPatientListDatasets = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const results = await allowAllDatasets();
        dispatch(setDatasetSearchResult(results));
        dispatch(setDatasetSearchTerm(''));
    };
};

export const setAdminDatasetSearchMode = (admin: boolean) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const results = await setAdminMode(admin);
        dispatch(setDatasetSearchResult(results));
        dispatch(setDatasetSearchTerm(''));
    };
};

// Synchronous
export const addDataset = (dataset: PatientListDatasetQuery): DatasetAction  => {
    return {
        dataset,
        type: ADD_DATASET
    };
};

export const setDataset = (dataset: PatientListDatasetQuery): DatasetAction  => {
    return {
        dataset,
        type: SET_DATASET
    };
};

export const switchDatasetOldForNew = (dataset: PatientListDatasetQuery, newDataset: PatientListDatasetQuery): DatasetAction => {
    return {
        dataset,
        newDataset,
        type: SWITCH_DATASET_OLD_FOR_NEW
    };
};

export const setDatasetSelected = (dataset: PatientListDatasetQuery): DatasetAction  => {
    return {
        dataset,
        type: SET_DATASET_SELECTED
    };
};

export const setDatasetDisplay = (dataset: PatientListDatasetQuery): DatasetAction  => {
    return {
        dataset,
        type: SET_DATASET_DISPLAY
    };
};

export const moveDatasetCategory = (dataset: PatientListDatasetQuery, category: string): DatasetAction  => {
    return {
        dataset,                    // dataset (with old category name)
        category,                   // new category name
        type: MOVE_DATASET_CATEGORY
    };
};


export const setDatasets = (datasets: PatientListDatasetQuery[], result: DatasetSearchResult): DatasetAction => {
    return {
        result,
        datasets,
        type: SET_DATASETS
    };
};

export const setDatasetSearchTerm = (searchTerm: string): DatasetAction  => {
    return {
        searchTerm,
        type: SET_DATASETS_SEARCH_TERM
    };
};

export const setDatasetSearchResult = (result: DatasetSearchResult): DatasetAction => {
    return {
        result,
        type: SET_DATASETS_SEARCH_RESULT
    };
};

export const removeDataset = (dataset: PatientListDatasetQuery): DatasetAction => {
    return {
        dataset,
        type: REMOVE_DATASET
    }
};