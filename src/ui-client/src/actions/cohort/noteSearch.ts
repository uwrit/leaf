/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListDatasetQuery, PatientListDatasetDynamicSchema } from "../../models/patientList/Dataset";
import { DateBoundary } from "../../models/panel/Date";
import { Dispatch } from "redux";
import { AppState } from "../../models/state/AppState";
import { NetworkIdentity } from "../../models/NetworkResponder";
import { flushNotes, indexNotes, searchNotes } from "../../services/noteSearchApi";
import { fetchDataset } from "../../services/cohortApi";
import { Note } from "../../models/cohort/NoteSearch";
import { NoteSearchTerm } from "../../models/state/CohortState";
import { setNoClickModalState } from "../generalUi";
import { NotificationStates } from "../../models/state/GeneralUiState";
import { SearchResult } from "../../providers/noteSearch/noteSearchWebWorker";

export const SET_NOTE_DATASETS = 'SET_NOTE_DATASETS';
export const SET_NOTE_DATASET_CHECKED = 'SET_NOTE_DATASET_CHECKED';
export const SET_NOTE_SEARCH_DATERANGE = 'SET_NOTE_SEARCH_DATERANGE';
export const SET_NOTE_SEARCH_TERMS = 'SET_NOTE_SEARCH_TERMS';
export const SET_NOTE_SEARCH_RESULTS = 'SET_NOTE_SEARCH_RESULTS';

export interface NoteSearchAction {
    datasetId?: string;
    datasets?: PatientListDatasetQuery[];
    dateFilter?: DateBoundary;
    id: number;
    searchResults?: SearchResult;
    searchTerms?: NoteSearchTerm[];
    type: string;
}

// Asynchronous
export const searchNotesByTerms = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        const { terms } = state.cohort.noteSearch;
        const results = await searchNotes(terms);
        dispatch(setNoteSearchResults(results));
    };
}

export const getNotes = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        const responders: NetworkIdentity[] = [];
        const noteDatasets = [ ...state.cohort.noteSearch.datasets.values() ].filter(ds => ds.checked);
        const dates = state.cohort.noteSearch.dateFilter;
        const notes: Note[] = [];
        state.responders.forEach((nr) => { 
            if (nr.enabled || nr.isHomeNode) { 
                responders.push(nr); 
            } 
        });

        // Clear previous
        dispatch(setNoClickModalState({ message: "Loading Notes", state: NotificationStates.Working }));
        await flushNotes();

        // Wrap and await each dataset
        Promise.all(
            noteDatasets.map(ds => {
                return new Promise( async(resolve, reject) => {

                    // Wrap and await each responder
                    await Promise.all(
                        responders.map((nr, i) => { 
                            return new Promise( async(resolve, reject) => {
                                let queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;

                                // Request counts
                                fetchDataset(getState(), nr, queryId, ds, dates)
                                    .then(
                                        response => {
                                            // FIXME - need to allow non-dynamic as well
                                            const schema = response.schema as PatientListDatasetDynamicSchema;
                                            let j = 0;
                                            for (const patId of Object.keys(response.results)) {
                                                for (const row of response.results[patId]) {
                                                    const note: Note = {
                                                        responderId: nr.id, 
                                                        id: `${nr.id}_${j}`,
                                                        date: row[schema.sqlFieldDate],
                                                        text: row[schema.sqlFieldValueString],
                                                        type: ds.name
                                                    };
                                                    notes.push(note);
                                                    j++;
                                                }
                                            }
                                            
                                    },  error => {
                                        dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                                    })
                                    .then(() => resolve(null));
                            });
                        })          
                    )
                    .then(() => resolve(null));
                });
            })
        ).then( async() => {
            await indexNotes(notes);
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
        });
    };
};


// Synchronous
export const setNoteDatasets = (datasets: PatientListDatasetQuery[]): NoteSearchAction => {
    return {
        datasets,
        id: -1,
        type: SET_NOTE_DATASETS
    };
};

export const setNoteDatasetChecked = (datasetId: string): NoteSearchAction => {
    return {
        datasetId,
        id: -1,
        type: SET_NOTE_DATASET_CHECKED
    };
};


export const setNoteSearchDateRange = (dateFilter: DateBoundary): NoteSearchAction => {
    return {
        dateFilter,
        id: -1,
        type: SET_NOTE_DATASET_CHECKED
    };
};

export const setNoteSearchTerms = (searchTerms: NoteSearchTerm[]): NoteSearchAction => {
    return {
        searchTerms,
        id: -1,
        type: SET_NOTE_SEARCH_TERMS
    };
};

export const setNoteSearchResults = (searchResults: SearchResult): NoteSearchAction => {
    return {
        searchResults,
        id: -1,
        type: SET_NOTE_SEARCH_RESULTS
    };
};
