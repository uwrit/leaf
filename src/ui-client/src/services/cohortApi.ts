/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CancelTokenSource } from 'axios';
import { AppState } from '../models/state/AppState';
import { NetworkIdentity } from '../models/NetworkResponder';
import { PanelDTO } from '../models/panel/Panel';
import { PanelFilter } from '../models/panel/PanelFilter';
import { HttpFactory } from './HttpFactory';
import { DateIncrementType, DateFilter, DateBoundary } from '../models/panel/Date';
import { PatientListDatasetQueryDTO, PatientListDatasetDTO, PatientListDatasetQuery } from '../models/patientList/Dataset';
import moment from 'moment'

/*
 * Fetch patient counts based on current panel setup.
 */
export function fetchCount(state: AppState, nr: NetworkIdentity, panelFilters: PanelFilter[], panels: PanelDTO[], queryId: string, cancelToken: CancelTokenSource) {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const request = http.post(`${nr.address}/api/cohort/count`, { 
        cancelToken: cancelToken.token,
        panelFilters,
        panels, 
        queryId, 
    });
    return request;
};

/*
 * Fetch demographics (shared by patient list and visuzalization)
 * based on already run patient counts.
 */
export function fetchDemographics(state: AppState, nr: NetworkIdentity, queryId: string, cancelToken: CancelTokenSource) {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get(`${nr.address}/api/cohort/${queryId}/demographics`);
};

/*
 * Fetch a dataset, which may or may not have date boundaries.
 */
export const fetchDataset = async (
        state: AppState, 
        nr: NetworkIdentity, 
        queryId: string, 
        dataset: PatientListDatasetQuery, 
        dates?: DateBoundary,
        panelIndex?: number
    ): Promise<PatientListDatasetDTO> => {

    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const params: any = {
        datasetid: nr.isHomeNode ? dataset.id : dataset.universalId,
        shape: dataset.shape
    }
    if (typeof panelIndex !== 'undefined') {
        params.panelIdx = panelIndex
    } else if (dates && dates.start.dateIncrementType !== DateIncrementType.NONE && dates.end.dateIncrementType !== DateIncrementType.NONE) {
        params.early = deriveDateTicks(dates.start);
        params.late = deriveDateTicks(dates.end);
    }

    const result = await http.get(`${nr.address}/api/cohort/${queryId}/dataset`, { params });
    return result.data as PatientListDatasetDTO
};

export const fetchAvailableDatasets = async (state: AppState): Promise<PatientListDatasetQueryDTO[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`/api/dataset`);
    const ds = resp.data as PatientListDatasetQueryDTO[];
    return ds;
};

/*
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