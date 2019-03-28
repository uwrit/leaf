/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { ConceptSqlSet, ConceptSqlSetDTO } from '../../models/admin/Concept';
import { getSpecializationGroups } from './specializationGroupApi';

/*
 * Gets all current Concept SQLSets.
 */ 
export const getSqlSets = async (state: AppState): Promise<ConceptSqlSet[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/sqlset');
    const sets = resp.data  as ConceptSqlSet[];
    const groups = await getSpecializationGroups(state);
    const setIdxMap: Map<number,number> = new Map();

    /*
     * Map index of each set for reference.
     */
    for (let i = 0; i < sets.length; i++) {
        sets[i].specializationGroups = new Map();
        const set = sets[i];
        setIdxMap.set(set.id, i);
    }
    
    /*
     * Update each set directly from index crosswalk.
     */
    for (const grp of groups) {
        const idx = setIdxMap.get(grp.sqlSetId)!;
        grp.specializations.forEach((s) => s.sqlSetId = grp.sqlSetId);
        if (idx) {
            const set = sets[idx];
            set.specializationGroups.set(grp.id, grp);
        }
    }

    return sets;
};

/*
 * Updates an existing Concept SQLSet.
 */ 
export const updateSqlSet = async (state: AppState, set: ConceptSqlSet): Promise<ConceptSqlSetDTO> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/sqlset/${set.id}`, set);
    return resp.data as ConceptSqlSetDTO;
};

/*
 * Creates a new Concept SQLSet.
 */ 
export const createSqlSet = async (state: AppState, set: ConceptSqlSet): Promise<ConceptSqlSetDTO> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/sqlset`, set );
    return resp.data as ConceptSqlSetDTO;
};

/*
 * Deletes an existing Concept SQLSet.
 */ 
export const deleteSqlSet = async (state: AppState, set: ConceptSqlSet) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`api/admin/sqlset/${set.id}`);
};
