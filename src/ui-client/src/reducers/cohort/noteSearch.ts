/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { NoteSearchState, CohortState, CohortStateType } from '../../models/state/CohortState';
import { NoteSearchDatasetQuery } from '../../models/patientList/Dataset';
import { NoteSearchAction } from '../../actions/cohort/noteSearch';
import { DateIncrementType } from '../../models/panel/Date';

export function defaultNoteSearchState(): NoteSearchState {
    return {
        datasets: new Map<string, NoteSearchDatasetQuery>(),
        dateFilter: {
            display: 'Anytime',
            end: {
                dateIncrementType: DateIncrementType.NONE,
                increment: 1
            },
            start: {
                dateIncrementType: DateIncrementType.NONE,
                increment: 1
            }
        },
        results: { documents: [] },
        terms: [],
        radixSearch: {  
            prefix: "", 
            result: []  
        }  
         };
}

export function setNoteDatasets(state: CohortState, action: NoteSearchAction): CohortState {
    const datasets = new Map<string, NoteSearchDatasetQuery>();
    for (const ds of action.datasets!) {
        datasets.set(ds.id, {
            ...ds,
            checked: false,
            status: CohortStateType.NOT_LOADED
        })
    }
    
    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            datasets
        }
    });
};

export function setNoteDatasetChecked(state: CohortState, action: NoteSearchAction): CohortState {
    const datasets = new Map(state.noteSearch.datasets);
    const ds = datasets.get(action.datasetId!);

    if (ds) {
        ds.checked = !ds.checked;
    }
    datasets.set(action.datasetId, ds);

    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            datasets
        }
    });
};

export function setNoteSearchTerms(state: CohortState, action: NoteSearchAction): CohortState {
    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            terms: action.searchTerms.slice()
        }
    });
};

export function setNoteSearchResults(state: CohortState, action: NoteSearchAction): CohortState {
    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            results: action.searchResults
        }
    });
};


export function setNoteSearchPrefixResults(state: CohortState, action: NoteSearchAction): CohortState {
    return Object.assign({}, state, {
        noteSearch: {
            ...state.noteSearch,
            radixSearch: action.prefixResults
        }
    });
}