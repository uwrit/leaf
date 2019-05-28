/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from '../HttpFactory';
import { DatasetQueryCategory } from '../../models/admin/Dataset';
import { sleep } from '../../utils/Sleep';

/*
 * Gets all current Dataset Query Categories.
 */ 
export const getDatasetQueryCategories = async (state: AppState): Promise<DatasetQueryCategory[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);

    /*
    const resp = await http.get('api/admin/datasetquerycategory');
    const cats = resp.data as DatasetQueryCategory[];
    */
    const cats: DatasetQueryCategory[] = [
        { id: 1, category: 'Labs' },
        { id: 2, category: 'Procedures' },
        { id: 3, category: 'Diagnoses' },
    ];
    return cats;
};

/*
 * Updates an existing Dataset Query Category
 */ 
export const updateDatasetQueryCategory = async (state: AppState, cat: DatasetQueryCategory): Promise<DatasetQueryCategory> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    /*
    const resp = await http.put(`api/admin/datasetquerycategory/${cat.id}`, cat);
    const updated = resp.data as DatasetQueryCategory;
    return updated;
    */
    await sleep(2000);
    return cat;
};

/*
 * Creates a new Dataset Query Category.
 */ 
export const createDatasetQueryCategory = async (state: AppState, cat: DatasetQueryCategory): Promise<DatasetQueryCategory> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    /*
    const resp = await http.post(`api/admin/datasetquerycategory`, {
        ...cat,
        id: null
    });
    const newCat = resp.data as DatasetQueryCategory;
    return newCat;
    */
    await sleep(2000);
    return cat;
};

/*
 * Deletes an existing Dataset Query Category.
 */ 
export const deleteDatasetQueryCategory = async (state: AppState, cat: DatasetQueryCategory) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    // return http.delete(`api/admin/datasetquerycategory/${cat.id}`);
    await sleep(2000);
};
