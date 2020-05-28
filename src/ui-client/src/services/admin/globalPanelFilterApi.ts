/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { GlobalPanelFilter } from '../../models/admin/GlobalPanelFilter';

/*
 * Gets all current Global Panel Filters.
 */ 
export const getGlobalPanelFilters = async (state: AppState): Promise<GlobalPanelFilter[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/globalpanelfilter');
    const pfs = resp.data as GlobalPanelFilter[];
    return pfs;
};

/*
 * Updates an existing Global Panel Filter.
 */ 
export const updateGlobalPanelFilter = async (state: AppState, pf: GlobalPanelFilter): Promise<GlobalPanelFilter> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/globalpanelfilter/${pf.id}`, pf);
    const updated = resp.data as GlobalPanelFilter;
    return updated;
};

/*
 * Creates a new Global Panel Filter.
 */ 
export const createGlobalPanelFilter = async (state: AppState, pf: GlobalPanelFilter): Promise<GlobalPanelFilter> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/globalpanelfilter`, pf);
    const created = resp.data as GlobalPanelFilter;
    return created;
};

/*
 * Deletes an existing Global Panel Filter.
 */ 
export const deleteGlobalPanelFilter = async (state: AppState, pf: GlobalPanelFilter) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`api/admin/globalpanelfilter/${pf.id}`);
};
