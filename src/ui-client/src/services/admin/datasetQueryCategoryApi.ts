/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from '../HttpFactory';
import { DatasetQueryCategory } from '../../models/admin/Dataset';

/*
 * Gets all current Dataset Query Categories.
 */ 
export const getDatasetQueryCategories = async (state: AppState): Promise<DatasetQueryCategory[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/datasetcategory');
    const cats = resp.data as DatasetQueryCategory[];
    return cats;
};

/*
 * Updates an existing Dataset Query Category
 */ 
export const updateDatasetQueryCategory = async (state: AppState, cat: DatasetQueryCategory): Promise<DatasetQueryCategory> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/datasetcategory/${cat.id}`, cat);
    const updated = resp.data as DatasetQueryCategory;
    return updated;
};

/*
 * Creates a new Dataset Query Category.
 */ 
export const createDatasetQueryCategory = async (state: AppState, cat: DatasetQueryCategory): Promise<DatasetQueryCategory> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/datasetcategory`, {
        ...cat,
        id: null
    });
    const newCat = resp.data as DatasetQueryCategory;
    return newCat;
};

/*
 * Deletes an existing Dataset Query Category.
 */ 
export const deleteDatasetQueryCategory = async (state: AppState, cat: DatasetQueryCategory) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    await http.delete(`api/admin/datasetcategory/${cat.id}`);
};
