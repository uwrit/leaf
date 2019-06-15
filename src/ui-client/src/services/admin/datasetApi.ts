/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { AdminDatasetQuery, AdminDemographicQuery } from '../../models/admin/Dataset';
import { PatientListDatasetShape } from '../../models/patientList/Dataset';
import { sleep } from '../../utils/Sleep';

// DEV EXAMPLES
const demographics: AdminDatasetQuery = {
    id: 'demographics',
    constraints: [],
    name: 'Basic Demographics',
    shape: PatientListDatasetShape.Demographics,
    sqlStatement: "SELECT personId = cast(p.person_id as nvarchar), addressPostalCode = l.zip, addressState = p.location_state, ethnicity = p.ethnicity, gender = CASE WHEN p.gender = 'F' THEN 'female' WHEN p.gender = 'M' THEN 'male' ELSE 'other' END, [language] = 'Unknown', maritalStatus = 'Unknown', race = p.race, religion = 'Unknown', marriedBoolean = cast(0 as bit), hispanicBoolean = cast(CASE WHEN p.ethnicity_code = 38003563 THEN 1 ELSE 0 END as bit), deceasedBoolean = cast(CASE WHEN p.death_date IS NULL THEN 0 ELSE 1 END as bit), birthDate = p.birth_datetime, deceasedDateTime = p.death_date, [name] = 'Unknown Unknown', mrn = 'abc12345' FROM v_person p JOIN person ps on p.person_id = ps.person_id LEFT JOIN [location] l on ps.location_id = l.location_id",
    tags: []
};

/*
 * Gets a Dataset.
 */ 
export const getAdminDataset = async (state: AppState, id: string): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/dataset/${id}`);
    const ds = resp.data as AdminDatasetQuery;
    return ds;
};

/*
 * Updates an existing Dataset.
 */ 
export const updateDataset = async (state: AppState, dataset: AdminDatasetQuery): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/dataset/${dataset.id}`, dataset);
    const ds = resp.data as AdminDatasetQuery;
    return ds;
};

/*
 * Creates a new Dataset.
 */ 
export const createDataset = async (state: AppState, dataset: AdminDatasetQuery): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/dataset`, {
        ...dataset,
        id: null
    });
    const ds = resp.data as AdminDatasetQuery;
    return ds;
};

/*
 * Deletes an existing Dataset
 */ 
export const deleteDataset = async (state: AppState, dataset: AdminDatasetQuery) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    await http.delete(`api/admin/dataset/${dataset.id}`);
};

/*
 * Gets the Demographics Dataset.
 */ 
export const getAdminDemographicsDataset = async (state: AppState): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/demographics`);
    const ds = resp.data as AdminDemographicQuery;
    const converted: AdminDatasetQuery = {
        id: 'demographics',
        constraints: [],
        name: 'Basic Demographics',
        shape: PatientListDatasetShape.Demographics,
        sqlStatement: ds.sqlStatement ? ds.sqlStatement : '',
        tags: [],
        unsaved: new Date(ds.lastChanged).getFullYear() === 0
    };
    return converted;
};

/*
 * Updates or Inserts existing Demographics Dataset.
 */ 
export const upsertDemographicsDataset = async (state: AppState, dataset: AdminDatasetQuery): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/demographics`, {
        sqlStatement: dataset.sqlStatement
    });
    const ds = resp.data as AdminDemographicQuery;
    const converted: AdminDatasetQuery = {
        ...dataset,
        ...ds,
    };
    return converted;
};