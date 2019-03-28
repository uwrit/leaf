/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import DatasetSearchEngineWebWorker from "../providers/datasetSearch/datasetSearchWebWorker";
import { PatientListDatasetQueryDTO, CategorizedDatasetRef } from "../models/patientList/Dataset";


const engine = new DatasetSearchEngineWebWorker();

export const addDatasets = (datasets: PatientListDatasetQueryDTO[]): Promise<CategorizedDatasetRef[]> => {
    return new Promise( async (resolve, reject) => {
        const result = await engine.addDatasets(datasets) as CategorizedDatasetRef[];
        resolve(result);
    });
};

export const searchDatasets = (searchTerm: string): Promise<CategorizedDatasetRef[]> => {
    return new Promise( async (resolve, reject) => {
        const term = searchTerm.trim().toLowerCase();
        const result = await engine.searchDatasets(term) as CategorizedDatasetRef[];
        resolve(result);
    });
};

export const allowDatasetInSearch = (datasetId: string, include: boolean) => {
    return new Promise( async (resolve, reject) => {
        await engine.allowDatasetInSearch(datasetId, include);
        resolve();
    });
};

export const allowAllDatasets = (): Promise<CategorizedDatasetRef[]> => {
    return new Promise( async (resolve, reject) => {
        const result = await engine.allowAllDatasets() as CategorizedDatasetRef[];
        resolve(result);
    });
};