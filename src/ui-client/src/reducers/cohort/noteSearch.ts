/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { NoteSearchState, CohortState, CohortStateType } from '../../models/state/CohortState';
import { NoteSearchDatasetQuery } from '../../models/patientList/Dataset';
import { CohortNoteSearchAction } from '../../actions/cohort/noteSearch';
import { PatientListSortType } from '../../models/patientList/Configuration';

export function defaultNoteSearchState(): NoteSearchState {
    return {
        configuration: {
            displayColumns: [],
            isFetching: false,
            multirowDatasets: new Map(),
            pageNumber: 0,
            pageSize: 10,
            singletonDatasets: new Map(),
            sort: { 
                sortType: PatientListSortType.NONE
            }
        },
        results: { documents: [] },
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
            configuration: action.configuration
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


export function setNoteSearchPrefixResults(state: CohortState, action: CohortNoteSearchAction): CohortState {
    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            radixSearch: action.prefixResults
        }
    });
}