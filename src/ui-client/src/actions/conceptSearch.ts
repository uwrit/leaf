/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Action, Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { ConceptEquivalentHint, AggregateConceptHintRef } from '../models/concept/ConceptHint';
import { fetchConceptEquivalentHintFromServer, getHints, initializeSearch } from '../services/conceptHintSuggestionApi';

export const SET_SEARCH_ROOT = 'SET_SEARCH_ROOT';
export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';
export const SEND_SEARCH = 'SEND_SEARCH';
export const SET_SEARCH_HINTS = 'SET_SEARCH_HINTS';
export const SET_EQUIVALENT_SEARCH_HINT = 'SET_EQUIVALENT_SEARCH_HINT';
export const RESET_EQUIVALENT_SEARCH_HINT = 'RESET_EQUIVALENT_SEARCH_HINT';
export const ERROR_SEARCH = 'ERROR_SEARCH';

export interface ConceptSearchAction {
    equivalent?: ConceptEquivalentHint;
    error?: string;
    hints?: AggregateConceptHintRef[];
    term?: string;
    rootId?: string;
    type: string;
}

// Async actions
/*
 * Initiliaze the search engine web worker. This 
 * let's the worker know the concept root ids it 
 * should prepare to recieve and index concepts for.
 */
export const initializeSearchEngine = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        initializeSearch(state).then(
            (response: any) => { return; },
            (error: any) => console.log('Search engine initialization failed', error)        
        );
    }
};

/*
 * Request concept hints from the server. These
 * appear as selectable dropdown items in the concept
 * search box.
 */
export const requestConceptHints = (term: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        getHints(state, term).then(
            (response: any) => {
                dispatch(setSearchHints(response));
                if (term === getState().conceptSearch.term) { }
            },
            (error: any) => console.log(error)        
        );
    };
};

/*
 * Requests a possible equivalent to an ICD9/10 code
 * typed in the search box (e.g., if the user searches for 
 * a pattern matching ICD10 code E11.1, it's ICD9 equivalent
 * will be displayed for convenience).
 */
export const requestConceptEquivalentHint = (term: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        fetchConceptEquivalentHintFromServer(term, state).then(
            (response: any) => dispatch(setSearchEquivalentHint(term, response.data)),
            (error: any) => console.log(error)        
        );
    };
};

// Synchronous actions
export const setSearchRoot = (rootId: string): ConceptSearchAction => {
    return {
        rootId,
        type: SET_SEARCH_ROOT
    };
};

export const setSearchTerm = (term: string): ConceptSearchAction => {
    return {
        term,
        type: SET_SEARCH_TERM
    };
};

export const sendSearch = (): ConceptSearchAction => {
    return {
        type: SEND_SEARCH
    };
};

export const setSearchHints = (hints: AggregateConceptHintRef[]): ConceptSearchAction => {
    return {
        hints,
        type: SET_SEARCH_HINTS
    };
};

export const errorSearch = (error: string): ConceptSearchAction => {
    return {
        error,
        type: ERROR_SEARCH
    };
};

export const setSearchEquivalentHint = (term: string, equivalent: ConceptEquivalentHint): ConceptSearchAction => {
    return {
        equivalent,
        term,
        type: SET_EQUIVALENT_SEARCH_HINT
    };
};