/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { AdminDatasetQuery, AdminDemographicQuery, toDTO, fromDTO, AdminDatasetQueryDTO, AdminDemographicQueryDTO } from '../../models/admin/Dataset';
import { PatientListDatasetShape } from '../../models/patientList/Dataset';
import { mapToObject } from '../../utils/mapToObject';

/*
 * Gets a Dataset.
 */ 
export const getAdminDataset = async (state: AppState, id: string): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/dataset/${id}`);
    const ds = resp.data as AdminDatasetQueryDTO;
    return fromDTO(ds);
};

/*
 * Updates an existing Dataset.
 */ 
export const updateDataset = async (state: AppState, dataset: AdminDatasetQuery): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/dataset/${dataset.id}`, toDTO(dataset));
    const ds = resp.data as AdminDatasetQueryDTO;
    return fromDTO(ds);
};

/*
 * Creates a new Dataset.
 */ 
export const createDataset = async (state: AppState, dataset: AdminDatasetQuery): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/dataset`, {
        ...toDTO(dataset),
        id: null
    });
    const ds = resp.data as AdminDatasetQueryDTO;
    return fromDTO(ds);
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
export const getAdminDemographicsDataset = async (state: AppState): Promise<AdminDemographicQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/demographics`);
    const ds = resp.data as AdminDemographicQueryDTO;
    const converted: AdminDemographicQuery = {
        id: 'demographics',
        columnNames: new Map(Object.entries(ds.columnNames)),
        constraints: [],
        isEncounterBased: false,
        name: 'Basic Demographics',
        shape: PatientListDatasetShape.Demographics,
        sqlStatement: ds.sqlStatement ? ds.sqlStatement : 'SELECT FROM dbo.table',
        tags: [],
        unsaved: new Date(ds.lastChanged).getFullYear() === 0
    };
    return converted;
};

/*
 * Updates or Inserts existing Demographics Dataset.
 */ 
export const upsertDemographicsDataset = async (state: AppState, dataset: AdminDemographicQuery): Promise<AdminDemographicQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const params: any = {
        sqlStatement: dataset.sqlStatement,
        columnNames: {}
    };
    for (const pair of dataset.columnNames.entries()) {
        params.columnNames[pair[0]] = pair[1];
    }
    const resp = await http.put(`api/admin/demographics`, params);
    const ds = resp.data as AdminDemographicQuery;
    const converted: AdminDemographicQuery = {
        ...dataset,
        ...ds,
        columnNames: new Map(Object.entries(ds.columnNames)),
        unsaved: false
    };
    return converted;
};