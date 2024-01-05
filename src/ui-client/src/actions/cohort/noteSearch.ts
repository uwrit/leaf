/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListDatasetQuery, PatientListDatasetDynamicSchema, PatientListDatasetShape } from "../../models/patientList/Dataset";
import { DateBoundary } from "../../models/panel/Date";
import { Dispatch } from "redux";
import { AppState } from "../../models/state/AppState";
import { NetworkIdentity } from "../../models/NetworkResponder";
import { flushNotes, indexNotes, searchNotes, searchPrefix } from "../../services/noteSearchApi";
import { fetchDataset } from "../../services/cohortApi";
import { Note } from "../../models/cohort/NoteSearch";
import { CohortStateType, NoteSearchTerm } from "../../models/state/CohortState";
import { setNoClickModalState, showInfoModal } from "../generalUi";
import { InformationModalState, NotificationStates } from "../../models/state/GeneralUiState";
import { SearchResult, RadixTreeResult } from "../../providers/noteSearch/noteSearchWebWorker";

export const SET_NOTE_DATASETS = 'SET_NOTE_DATASETS';
export const SET_NOTE_DATASET_CHECKED = 'SET_NOTE_DATASET_CHECKED';
export const SET_NOTE_SEARCH_DATERANGE = 'SET_NOTE_SEARCH_DATERANGE';
export const SET_NOTE_SEARCH_TERMS = 'SET_NOTE_SEARCH_TERMS';
export const SET_NOTE_SEARCH_RESULTS = 'SET_NOTE_SEARCH_RESULTS';
export const SET_NOTE_SEARCH_RADIX_TREE = 'SET_NOTE_SEARCH_RADIX_TREE'
export const SET_NOTE_SEARCH_PREFIX_RESULTS = 'SET_NOTE_SEARCH_PREFIX_RESULTS';  

export interface NoteSearchAction {
    datasetId?: string;
    datasets?: PatientListDatasetQuery[];
    dateFilter?: DateBoundary;
    id: number;
    searchResults?: SearchResult;
    searchTerms?: NoteSearchTerm[];
    type: string;
    prefixResults?: RadixTreeResult; 
}

// Asynchronous
export const searchNotesByTerms = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        const { terms } = state.cohort.noteSearch;
        dispatch(setNoClickModalState({ message: "Searching", state: NotificationStates.Working }));
        const results = await searchNotes(terms);
        dispatch(setNoteSearchResults(results));
        dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
    };
}

/*
export const searchPrefixTerms = (prefix: string) => {  
    return async (dispatch: Dispatch, getState: () => AppState) => {  
        const state = getState();  
        const results = await searchPrefix(prefix);
        dispatch(setNoteSearchPrefixResults(results));  
    };  
} 
*/ 
  

export const getNotes = (dataset: PatientListDatasetQuery, dates?: DateBoundary, panelIndex?: number) => {  
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        const responders: NetworkIdentity[] = [];
        const notes: Note[] = [];  
        let atLeastOneSucceeded = false;
        let panelIdx = panelIndex;

        /**
         * Determine true panel index, if applicable (removing empty panels)
         */
        if (typeof panelIdx !== 'undefined') {
            const panelsToRemove = state.panels.filter(p => p.index < panelIdx! && p.subPanels.filter(sp => sp.panelItems.length > 0).length === 0).length;
            panelIdx = panelIdx - panelsToRemove;
        }

        state.responders.forEach((nr: NetworkIdentity) => { 
            const crt = state.cohort.networkCohorts.get(nr.id)!;
            if (nr.enabled && ((nr.isHomeNode && !nr.isGateway) || !nr.isHomeNode) &&
                crt.count.state === CohortStateType.LOADED && 
                crt.patientList.state === CohortStateType.LOADED
            ) { responders.push(nr); }
        });

        Promise.all(responders.map((nr: NetworkIdentity, i: number) => { 
            return new Promise( async (resolve, reject) => {
                try {
                    if (nr.isHomeNode || (dataset.universalId && dataset.shape !== PatientListDatasetShape.Dynamic)) {
                        const queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;
                        const response = await fetchDataset(state, nr, queryId, dataset, dates, panelIdx);
                        const schema = response.schema as PatientListDatasetDynamicSchema;  
                        let j = 0;  
                        for (const patId of Object.keys(response.results)) {  
                            for (const row of response.results[patId]) {  
                                const note: Note = {  
                                    responderId: nr.id,   
                                    id: `${nr.id}_${j}`,  
                                    date: row[schema.sqlFieldDate],  
                                    text: row[schema.sqlFieldValueString],  
                                    type: dataset.name  
                                };  
                                notes.push(note);  
                                j++;  
                            }  
                        }
                        atLeastOneSucceeded = true;
                    }
                } catch (err) {
                    console.log(err);
                }
                resolve(null);
            });
        }))
        .then( async () => {
            if (atLeastOneSucceeded) {
                dispatch(setNoClickModalState({ message: "Analyzing text", state: NotificationStates.Working }));  
                await indexNotes(notes);  
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));  
            } else {
                const info: InformationModalState = {
                    body: "Leaf encountered an error when attempting to load this dataset. Please contact your Leaf administrator with this information.",
                    header: "Error Loading Dataset",
                    show: true
                };
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                dispatch(showInfoModal(info));
            }
        });
    }
};  

export const setNoteSearchPrefixResults = (results: RadixTreeResult): NoteSearchAction => { 
    return  {
    prefixResults: results,
    id: -1,
    type: SET_NOTE_SEARCH_PREFIX_RESULTS
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