/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import DatasetSearchEngineWebWorker from "../providers/datasetSearch/datasetSearchWebWorker";
import { PatientListDatasetQuery, DatasetSearchResult } from "../models/patientList/Dataset";


const engine = new DatasetSearchEngineWebWorker();

export const indexDatasets = (datasets: PatientListDatasetQuery[]): Promise<DatasetSearchResult> => {
    return new Promise( async (resolve, reject) => {
        const result = await engine.indexDatasets(datasets) as DatasetSearchResult;
        resolve(result);
    });
};

export const searchDatasets = (searchTerm: string): Promise<DatasetSearchResult> => {
    return new Promise( async (resolve, reject) => {
        const term = searchTerm.trim().toLowerCase();
        const result = await engine.searchDatasets(term) as DatasetSearchResult;
        resolve(result);
    });
};

export const allowDatasetInSearch = (datasetId: string, include: boolean) => {
    return new Promise( async (resolve, reject) => {
        await engine.allowDatasetInSearch(datasetId, include);
        resolve();
    });
};

export const allowAllDatasets = (): Promise<DatasetSearchResult> => {
    return new Promise( async (resolve, reject) => {
        const result = await engine.allowAllDatasets() as DatasetSearchResult;
        resolve(result);
    });
};

export const allowDemographics = (allow: boolean): Promise<DatasetSearchResult> => {
    return new Promise( async (resolve, reject) => {
        const result = await engine.allowDemographics(allow) as DatasetSearchResult;
        resolve(result);
    });
};