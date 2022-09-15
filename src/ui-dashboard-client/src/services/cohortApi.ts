/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CancelTokenSource } from 'axios';
import { AppState } from '../models/state/AppState';
import { baseUrl, HttpFactory } from './HttpFactory';
import moment from 'moment'
import { DateBoundary, DateFilter, DateIncrementType } from '../models/Date';
import { PatientListDatasetDTO, PatientListDatasetQueryDTO, PatientListDatasetShape } from '../models/patientList/Dataset';

/**
 * Fetch demographics (shared by patient list and visuzalization)
 * based on already run patient counts.
 */
 export const fetchDemographics = (
        state: AppState,
        queryId: string
    ) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get(`${baseUrl}/api/cohort/${queryId}/demographics`);
};

/**
 * Fetch a single patient dataset, which may or may not have date boundaries.
 */
export const fetchDataset = async (
        state: AppState, 
        //patientid: string,
        queryId: string, 
        datasetid: string, 
        shape: PatientListDatasetShape
    ): Promise<PatientListDatasetDTO> => {

    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const params: any = { datasetid, shape };

    const result = await http.get(`${baseUrl}/api/cohort/${queryId}/dataset`, { params });
    // const result = await http.get(`${baseUrl}/api/cohort/${queryId}/patients/${patientid}/dataset`, { params });
    return result.data as PatientListDatasetDTO
};

export const fetchAvailableDatasets = async (state: AppState): Promise<PatientListDatasetQueryDTO[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`${baseUrl}/api/dataset`);
    const ds = resp.data as PatientListDatasetQueryDTO[];
    return ds;
};

/**
 * Private method for getting UNIX ticks based on a given
 * DateFilter. Used when requesting datasets.
 */
const deriveDateTicks = (date: DateFilter): number => {
    const dateTypeKeyMap = new Map([
        [DateIncrementType.HOUR, 'h'],
        [DateIncrementType.DAY, 'd'],
        [DateIncrementType.WEEK, 'w'],
        [DateIncrementType.MONTH, 'M'],
        [DateIncrementType.YEAR, 'y']
    ]);

    if (date.dateIncrementType === DateIncrementType.NOW) {
        return Math.round(new Date().getTime() / 1000);
    }
    else if (date.dateIncrementType === DateIncrementType.SPECIFIC && date.date) {
        return Math.round(new Date(date.date!).getTime() / 1000);
    }
    else {
        const momentIncrementType = dateTypeKeyMap.get(date.dateIncrementType)!;
        const incr = date.increment as any;
        return Math.round(moment().add(incr, momentIncrementType).toDate().getTime() / 1000);
    }
};