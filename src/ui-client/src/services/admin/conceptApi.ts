/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { Concept } from '../../models/admin/Concept';

/*
 * Gets a full Concept (including SQL).
 */ 
export const getAdminConcept = async (state: AppState, conceptId: string) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/concept/${conceptId}`);
    return resp.data as Concept;
};

/*
 * Updates an existing Concept.
 */ 
export const updateAdminConcept = async (state: AppState, concept: Concept) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/concept/${concept.id}`, { 
        ...concept, 
        isRoot: !concept.parentId,
        rootId: concept.rootId
    });
    return resp.data as Concept;
};

/*
 * Creates a new Concept.
 */ 
export const createAdminConcept = async (state: AppState, concept: Concept) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/concept`, { 
        ...concept, 
        id: null,
        isRoot: !concept.parentId,
        rootId: (concept.id === concept.rootId ? null : concept.rootId),
        constraints: concept.constraints.map((c) => ({ ...c, conceptId: null }))
    });
    return resp.data as Concept;
};

/*
 * Deletes an existing Concept SQLSet.
 */ 
export const deleteAdminConcept = async (state: AppState, conceptId: string) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`api/admin/concept/${conceptId}`);
};
