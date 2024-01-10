/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { NoteSearchState, CohortState } from '../../models/state/CohortState';
import { CohortNoteSearchAction } from '../../actions/cohort/noteSearch';

export function defaultNoteSearchState(): NoteSearchState {
    return {
        configuration: {
            datasets: new Map(),
            isFetching: false,
            pageNumber: 0,
            pageSize: 10
        },
        results: { documents: [], totalDocuments: 0, totalPatients: 0, totalTermHits: 0 },
        terms: [],
        lookaheads: {  
            prefix: "", 
            result: []  
        }  
    };
}

export function setNoteSearchConfiguration(state: CohortState, action: CohortNoteSearchAction): CohortState {
    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            configuration: Object.assign({}, action.configuration)
        }
    });
};

export function setNoteSearchTerms(state: CohortState, action: CohortNoteSearchAction): CohortState {
    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            terms: action.searchTerms.slice()
        }
    });
};

export function setNoteSearchResults(state: CohortState, action: CohortNoteSearchAction): CohortState {
    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            results: action.searchResults
        }
    });
};

export function setNoteSearchFullNote(state: CohortState, action: CohortNoteSearchAction): CohortState {
    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            fullNote: action.note
        }
    });
};

export function setNoteSearchPrefixResults(state: CohortState, action: CohortNoteSearchAction): CohortState {
    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            radixSearch: action.prefixResults
        }
    });
};