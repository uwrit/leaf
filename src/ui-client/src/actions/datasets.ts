/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListDatasetQuery, DatasetSearchResult, CategorizedDatasetRef } from "../models/patientList/Dataset";
import { AppState } from "../models/state/AppState";
import { Dispatch } from "redux";
import { searchDatasets, allowAllDatasets, allowDemographics } from "../services/datasetSearchApi";

export const SET_DATASET = 'SET_DATASET';
export const MOVE_DATASET_CATEGORY = 'MOVE_DATASET_CATEGORY';
export const SET_DATASETS = 'SET_DATASETS';
export const SET_DATASETS_DISPLAY_ALL = 'SET_DATASET_DISPLAY_ALL';
export const SET_DATASETS_SEARCH_TERM = 'SET_DATASET_SEARCH_TERM';
export const SET_DATASETS_SEARCH_RESULT = 'SET_DATASET_SEARCH_RESULT';
export const REMOVE_DATASET = 'REMOVE_DATASET';
export const ADD_DATASET = 'ADD_DATASET';

export interface DatasetAction {
    category?: string;
    categories?: CategorizedDatasetRef[];
    datasetsAvailableCount?: number;
    dataset?: PatientListDatasetQuery;
    datasetCategoryIndex?: number;
    datasetIndex?: number;
    datasets?: PatientListDatasetQuery[];
    result?: DatasetSearchResult;
    searchTerm?: string;
    type: string;
}

// Asynchronous
export const searchPatientListDatasets = (searchTerm: string) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        if (searchTerm) {
            const results = await searchDatasets(searchTerm);
            dispatch(setDatasetSearchResult(results));
        } else {
            dispatch(setDatasetsDisplayAll());
        }
    };
};

export const resetPatientListDatasets = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const results = await allowAllDatasets();
        dispatch(setDatasetSearchResult(results));
        dispatch(setDatasetSearchTerm(''));
    };
};

export const allowDemographicsDatasetInSearch = (allow: boolean) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const results = await allowDemographics(allow);
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

export const setDataset = (dataset: PatientListDatasetQuery, datasetCategoryIndex: number, datasetIndex: number): DatasetAction  => {
    return {
        dataset,
        datasetCategoryIndex,
        datasetIndex,
        type: SET_DATASET
    };
};

export const moveDatasetCategory = (dataset: PatientListDatasetQuery, category: string): DatasetAction  => {
    return {
        dataset,                    // dataset (with old category name)
        category,                   // new category name
        type: MOVE_DATASET_CATEGORY
    };
};


export const setDatasets = (datasets: PatientListDatasetQuery[], categories: CategorizedDatasetRef[]): DatasetAction => {
    return {
        categories,
        datasets,
        type: SET_DATASETS
    };
};

export const setDatasetsDisplayAll = (): DatasetAction => {
    return {
        type: SET_DATASETS_DISPLAY_ALL
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

export const removeDataset = (datasetCategoryIndex: number, datasetIndex: number): DatasetAction => {
    return {
        datasetCategoryIndex,
        datasetIndex,
        type: REMOVE_DATASET
    }
};