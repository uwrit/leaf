/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { AdminDatasetQuery } from '../../models/admin/Dataset';
import { PatientListDatasetShape } from '../../models/patientList/Dataset';

/*
 * Gets a Dataset.
 */ 
export const getAdminDataset = (state: AppState): AdminDatasetQuery => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const dataset = {
        id: '8BB12CC0-E278-E911-9D11-B886875607D1',
        category: 'Labs',
        name: 'Platelet Count',
        shape: PatientListDatasetShape.Observation,
        sql: "SELECT personId      = CAST(SUBJECT_ID AS NVARCHAR), encounterId   = CAST(HADM_ID AS NVARCHAR), category      = 'lab', code          = LOINC_CODE, effectiveDate = DATEADD(YEAR,-150,CAST(CHARTTIME AS DATETIME))  , valueString   = VALUE, valueQuantity = VALUENUM, valueUnit     = VALUEUOM FROM [dbo].[v_LABEVENTS] WHERE LABEL = 'Platelet Count'"
    };
    return dataset;
};

/*
 * Updates an existing Dataset.
 */ 
export const updateDataset = (state: AppState, dataset: AdminDatasetQuery): AdminDatasetQuery => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return dataset;
};

/*
 * Creates a new Dataset.
 */ 
export const createDataset = (state: AppState, dataset: AdminDatasetQuery): AdminDatasetQuery => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return dataset;
};

/*
 * Deletes an existing Dataset
 */ 
export const deleteDataset = (state: AppState, dataset: AdminDatasetQuery) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
};