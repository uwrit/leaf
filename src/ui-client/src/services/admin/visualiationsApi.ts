/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AdminVisualizationPage } from '../../models/admin/Visualization';
import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';

/*
 * Get all Visualization Pages
 */ 
export const getAdminVisualizationPages = async (state: AppState): Promise<AdminVisualizationPage[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/visualization');
    const pages = resp.data as AdminVisualizationPage[];
    return pages;
};

/*
 * Create a new Visualization Page
 */ 
export const createAdminVisualiationPage = async (state: AppState, page: AdminVisualizationPage): Promise<AdminVisualizationPage> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post('api/admin/visualization', {
        page,
        id: null
    });
    const created = resp.data as AdminVisualizationPage;
    return created;
};

/*
 * Update an existing Visualization Page
 */ 
export const updateAdminVisualiationPage = async (state: AppState, page: AdminVisualizationPage): Promise<AdminVisualizationPage> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/visualization/${page.id}`, { page });
    const updated = resp.data as AdminVisualizationPage;
    return updated;
};

/*
 * Delete a Visualization Page
 */ 
export const deleteAdminVisualizationPage = async (state: AppState, page: AdminVisualizationPage) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    await http.delete(`api/admin/visualization/${page.id}`);
};
