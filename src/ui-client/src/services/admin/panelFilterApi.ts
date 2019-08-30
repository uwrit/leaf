/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { PanelFilter } from '../../models/admin/PanelFilter';

/*
 * Gets all current Panel Filters.
 */ 
export const getPanelFilters = async (state: AppState): Promise<PanelFilter[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/panelfilter');
    const pfs = resp.data as PanelFilter[];
    return pfs;
};

/*
 * Updates an existing Panel Filter.
 */ 
export const updatePanelFilter = async (state: AppState, pf: PanelFilter): Promise<PanelFilter> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/panelfilter/${pf.id}`, pf);
    const updated = resp.data as PanelFilter;
    return updated;
};

/*
 * Creates a new Panel Filter.
 */ 
export const createPanelFilter = async (state: AppState, pf: PanelFilter): Promise<PanelFilter> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/panelfilter`, pf);
    const created = resp.data as PanelFilter;
    return created;
};

/*
 * Deletes an existing Panel Filter.
 */ 
export const deletePanelFilter = async (state: AppState, pf: PanelFilter) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`api/admin/panelfilter/${pf.id}`);
};
