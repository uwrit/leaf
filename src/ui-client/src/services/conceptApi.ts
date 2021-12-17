/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { Concept } from '../models/concept/Concept';
import { HttpFactory } from './HttpFactory';

/*
 * Private general function for making any concept request.
 */
const makeRequest = async (state: AppState, requestString: string, requestParams?: object) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const request = requestParams
        ? http.get(requestString, requestParams)
        : http.get(requestString)
    return request;
};

/*
 * Fetch root concepts. Called at app login.
 */
export const fetchRootConcepts = (state: AppState) => {
    return makeRequest(state, 'api/concept');
};

/*
 * Fetch concept. Called on saved query open.
 */
export const fetchConcept = async (state: AppState, id: string) => {
    const con = await makeRequest(state, `api/concept/${id}`);
    return con.data as Concept;
};

/*
 * Fetch children concepts of a given concept. Called at drilldown.
 */
export const fetchConceptChildren = (concept: Concept, state: AppState) => {
    return makeRequest(state, `api/concept/${concept.id}/children`);
};

/*
 * Given a search term, fetch a concept tree 
 * based on descendent concept matches of the term.
 */
export const fetchConceptAncestorsBySearchTerm = (term: string, state: AppState) => {
    const terms = term.split(' ').map((t: string) => encodeURIComponent(t));
    const rootId = state.conceptSearch.rootId;
    return makeRequest(state, 'api/concept/search/parents', {
        params: {
            rootId: rootId === '' ? null : rootId,
            searchTerm: terms
        },
        paramsSerializer: (params: any) => {
            const pms = [ `searchTerm=${params.searchTerm.join('+')}` ];
            if (rootId) {
                pms.push(`rootId=${params.rootId}`);
            }
            return pms.join('&');
        }
    });
};

/*
 * Given an array of concept ids (from hints), 
 * request a concept tree.
 */
export const fetchConceptAncestorsByConceptIds = (conceptIds: string[], state: AppState) => {
    const threshold = 20;
    return makeRequest(state, 'api/concept/parents', {
        params: {
            idents: conceptIds.length > threshold
                ? conceptIds.slice(0, threshold)
                : conceptIds
        },
        paramsSerializer: (params: any) => {
            return params.idents.map((i: string) => `idents=${i}`).join('&');
        }
    });
};