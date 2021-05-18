/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { NetworkIdentity } from '../models/NetworkResponder';
import { PatientListDatasetDTO } from '../models/patientList/Dataset';
import { AppState } from '../models/state/AppState';
import { VisualizationDatasetQueryRef, VisualizationPageDTO } from '../models/visualization/Visualization';
import { HttpFactory } from './HttpFactory';

/**
 * Get all Visualization Pages available to user
 */
export const getVisualizationPages = async (state: AppState): Promise<VisualizationPageDTO[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const pagesObj = await http.get("/api/visualization");
    return pagesObj.data as Promise<VisualizationPageDTO[]>;
};

/**
 * Fetch a dataset, which may or may not have date boundaries.
 */
 export const fetchVisualizationDataset = async (
    state: AppState, 
    nr: NetworkIdentity, 
    queryId: string, 
    datasetQueryRef: VisualizationDatasetQueryRef,
): Promise<PatientListDatasetDTO> => {

    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const params: any = {
        datasetid: nr.isHomeNode ? datasetQueryRef.id : datasetQueryRef.universalId,
        shape: datasetQueryRef.shape
    }
    const result = await http.get(`${nr.address}/api/cohort/${queryId}/dataset`, { params });
    return result.data as PatientListDatasetDTO
};