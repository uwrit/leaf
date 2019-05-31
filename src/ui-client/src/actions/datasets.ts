/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListDatasetQuery, CategorizedDatasetRef } from "../models/patientList/Dataset";
import { AppState } from "../models/state/AppState";
import { Dispatch } from "redux";
import { searchDatasets, allowAllDatasets } from "../services/datasetSearchApi";

export const SET_PATIENTLIST_DATASETS = 'SET_PATIENTLIST_DATASETS';
export const SET_PATIENTLIST_DATASET_BY_INDEX = 'SET_PATIENTLIST_DATASET_BY_INDEX';
export const SET_DATASET_SEARCH_TERM = 'SET_DATASET_SEARCH_TERM';
export const SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT = 'SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT';
export const REMOVE_PATIENTLIST_DATASET = 'REMOVE_PATIENTLIST_DATASET';

export interface DatasetAction {
    datasetsAvailableCount?: number;
    dataset?: PatientListDatasetQuery;
    datasetCategoryIndex?: number;
    datasetIndex?: number;
    datasets?: CategorizedDatasetRef[];
    searchTerm?: string;
    type: string;
}

// Asynchronous
export const searchPatientListDatasets = (searchTerm: string) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const results = await searchDatasets(searchTerm);
        dispatch(setPatientListDatasets(results));
    };
};

export const getAllPatientListDatasets = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const results = await allowAllDatasets();
        dispatch(setPatientListDatasets(results));
        dispatch(setDatasetSearchTerm(''));
    };
};

// Synchronous
export const setPatientListDatasets = (datasets: CategorizedDatasetRef[]): DatasetAction => {
    return {
        datasets,
        type: SET_PATIENTLIST_DATASETS
    };
};

export const removePatientListDataset = (datasetCategoryIndex: number, datasetIndex: number): DatasetAction => {
    return {
        datasetCategoryIndex,
        datasetIndex,
        type: REMOVE_PATIENTLIST_DATASET
    }
};

export const setPatientListDatasetByIndex = (dataset: PatientListDatasetQuery, datasetCategoryIndex: number, datasetIndex: number): DatasetAction  => {
    return {
        dataset,
        datasetCategoryIndex,
        datasetIndex,
        type: SET_PATIENTLIST_DATASET_BY_INDEX
    };
};

export const setPatientListTotalDatasetsAvailableCount = (datasetsAvailableCount: number): DatasetAction  => {
    return {
        datasetsAvailableCount,
        type: SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT
    };
};

export const setDatasetSearchTerm = (searchTerm: string): DatasetAction  => {
    return {
        searchTerm,
        type: SET_DATASET_SEARCH_TERM
    };
};