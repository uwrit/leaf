/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { PanelFilter, PanelFilterDTO } from '../../models/admin/PanelFilter';
import { fetchConcept } from '../conceptApi';

/*
 * Gets all current Panel Filters.
 */ 
export const getPanelFilters = async (state: AppState): Promise<PanelFilter[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/panelfilter');
    const dtos = resp.data as PanelFilterDTO[];
    const pfs: PanelFilter[] = [];

    for (const dto of dtos) {
        const concept = await fetchConcept(state, dto.conceptId!);
        pfs.push({ ...dto, concept });
    }

    return pfs;
};

/*
 * Updates an existing Panel Filter.
 */ 
export const updatePanelFilter = async (state: AppState, pf: PanelFilter): Promise<PanelFilter> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const dto = toDto(pf);
    const resp = await http.put(`api/admin/panelfilter/${dto.id}`, dto);
    const updated = resp.data as PanelFilterDTO;
    return { ...pf, ...updated };
};

/*
 * Creates a new Panel Filter.
 */ 
export const createPanelFilter = async (state: AppState, pf: PanelFilter): Promise<PanelFilter> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const dto = toDto(pf);
    const resp = await http.post(`api/admin/panelfilter`, dto);
    const created = resp.data as PanelFilterDTO;
    return { ...pf, ...created };
};

/*
 * Deletes an existing Panel Filter.
 */ 
export const deletePanelFilter = async (state: AppState, pf: PanelFilter) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`api/admin/panelfilter/${pf.id}`);
};

const toDto = (pf: PanelFilter): PanelFilterDTO => {
    return {
        id: pf.id,
        conceptId: pf.conceptId!,
        isInclusion: pf.isInclusion,
        uiDisplayText: pf.uiDisplayText,
        uiDisplayDescription: pf.uiDisplayDescription
    };
};