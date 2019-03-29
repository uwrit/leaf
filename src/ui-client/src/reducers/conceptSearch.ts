/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { SHOW_DRILL_TREE } from '../actions/concepts';
import {
    ERROR_SEARCH,
    SEND_SEARCH,
    SET_EQUIVALENT_SEARCH_HINT,
    SET_SEARCH_HINTS,
    SET_SEARCH_ROOT,
    SET_SEARCH_TERM
} from '../actions/conceptSearch';
import { ConceptSearchAction } from '../actions/conceptSearch';
import { ConceptsSearchState } from '../models/state/AppState';
import { ConceptEquivalentHint, AggregateConceptHintRef } from '../models/concept/ConceptHint';

export function defaultConceptSearchState(): ConceptsSearchState {
    return {
        currentEquivalentHint: { targetCode: '', targetCodeType: '', uiDisplayTargetName: '' },
        currentHints: [],
        equivalentHintTerm: '',
        isFetching: false,
        rootId: '',
        term: ''
    };
}

function setEquivalentSearchTerm(state: ConceptsSearchState, term: string, equivalentHint: ConceptEquivalentHint): ConceptsSearchState {
    return Object.assign({}, state, {
        currentEquivalentHint: equivalentHint,
        equivalentHintTerm: term ? term : ''
    });
}

function setSearchTerm(state: ConceptsSearchState, term: string): ConceptsSearchState {
    return Object.assign({}, state, {
        term: term ? term : ''
    });
}

function setSearchRoot(state: ConceptsSearchState, parentId: string): ConceptsSearchState {
    return Object.assign({}, state, {
        rootId: parentId ? parentId : ''
    });
}

function sendSearch(state: ConceptsSearchState): ConceptsSearchState {
    return Object.assign({}, state, {
        isFetching: true
    });
}

function setSearchHints(state: ConceptsSearchState, hints: AggregateConceptHintRef[]): ConceptsSearchState {
    return Object.assign({}, state, {
        currentHints: hints ? hints : [],
        isFetching: false,
    });
}

export function conceptSearch(state: ConceptsSearchState = defaultConceptSearchState(), action: ConceptSearchAction): ConceptsSearchState {
    switch (action.type) {
        case SET_SEARCH_TERM:
            return setSearchTerm(state, action.term!);
        case SET_SEARCH_ROOT:
            return setSearchRoot(state, action.rootId!);
        case SEND_SEARCH:
            return sendSearch(state);
        case SET_SEARCH_HINTS:
            return setSearchHints(state, action.hints!);
        case SHOW_DRILL_TREE:
            return setSearchHints(state, []);
        case SET_EQUIVALENT_SEARCH_HINT:
            return setEquivalentSearchTerm(state, action.term!, action.equivalent!);
        case ERROR_SEARCH:
        default:
            return state;
    }
}