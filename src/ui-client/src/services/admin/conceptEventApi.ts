/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { ConceptEvent } from '../../models/admin/Concept';

/*
 * Gets all current Concept Events.
 */ 
export const getConceptEvents = async (state: AppState): Promise<ConceptEvent[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/conceptevent');
    const evs = resp.data as ConceptEvent[];
    return evs;
};

/*
 * Updates an existing Concept Event.
 */ 
export const updateConceptEvent = async (state: AppState, ev: ConceptEvent): Promise<ConceptEvent> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/conceptevent/${ev.id}`, ev);
    const updatedEv = resp.data as ConceptEvent;
    return updatedEv;
};

/*
 * Creates a new Concept Event.
 */ 
export const createConceptEvent = async (state: AppState, ev: ConceptEvent): Promise<ConceptEvent> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/conceptevent`, {
        ...ev,
        id: null
    });
    const newEv = resp.data as ConceptEvent;
    return newEv;
};

/*
 * Deletes an existing Concept Event.
 */ 
export const deleteConceptEvent = async (state: AppState, ev: ConceptEvent) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`api/admin/conceptevent/${ev.id}`);
};
