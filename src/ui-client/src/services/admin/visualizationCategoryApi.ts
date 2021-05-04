/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AdminVisualizationCategory } from '../../models/admin/Visualization';
import { AppState } from '../../models/state/AppState';
import { HttpFactory } from '../HttpFactory';

/*
 * Gets all current Dataset Query Categories.
 */ 
export const getVisualizationCategories = async (state: AppState): Promise<AdminVisualizationCategory[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/visualizationcategory');
    const cats = resp.data as AdminVisualizationCategory[];
    return cats;
};

/*
 * Updates an existing Dataset Query Category
 */ 
export const updateVisualizationCategory = async (state: AppState, cat: AdminVisualizationCategory): Promise<AdminVisualizationCategory> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/visualizationcategory/${cat.id}`, cat);
    const updated = resp.data as AdminVisualizationCategory;
    return updated;
};

/*
 * Creates a new Dataset Query Category.
 */ 
export const createVisualizationCategory = async (state: AppState, cat: AdminVisualizationCategory): Promise<AdminVisualizationCategory> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/visualizationcategory`, {
        ...cat,
        id: null
    });
    const newCat = resp.data as AdminVisualizationCategory;
    return newCat;
};

/*
 * Deletes an existing Dataset Query Category.
 */ 
export const deleteVisualizationCategory = async (state: AppState, cat: AdminVisualizationCategory) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    await http.delete(`api/admin/visualizationcategory/${cat.id}`);
};
