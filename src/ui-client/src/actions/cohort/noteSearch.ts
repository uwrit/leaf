/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListDatasetQuery, PatientListDatasetShape } from "../../models/patientList/Dataset";
import { DateBoundary } from "../../models/panel/Date";
import { Dispatch } from "redux";
import { AppState } from "../../models/state/AppState";
import { NetworkIdentity } from "../../models/NetworkResponder";
import { getHighlightedNoteFromResults, indexNotes, removeDataset, searchNotes } from "../../services/noteSearchApi";
import { fetchDataset } from "../../services/cohortApi";
import { NoteDatasetContext } from "../../models/cohort/NoteSearch";
import { CohortStateType, NoteSearchConfiguration, NoteSearchTerm } from "../../models/state/CohortState";
import { setNoClickModalState, showInfoModal } from "../generalUi";
import { InformationModalState, NotificationStates } from "../../models/state/GeneralUiState";
import { DocumentSearchResult, NoteSearchResult, RadixTreeResult } from "../../providers/noteSearch/noteSearchWebWorker";
import { allowDatasetInSearch } from "../../services/datasetSearchApi";
import { setDatasetSearchResult } from "../datasets";

export const SET_NOTE_SEARCH_TERMS = 'SET_NOTE_SEARCH_TERMS';
export const SET_NOTE_SEARCH_RESULTS = 'SET_NOTE_SEARCH_RESULTS';
export const SET_NOTE_SEARCH_CONFIGURATION = 'SET_NOTE_SEARCH_CONFIGURATION';
export const SET_NOTE_SEARCH_PREFIX_RESULTS = 'SET_NOTE_SEARCH_PREFIX_RESULTS';  
export const SET_NOTE_SEARCH_FULL_NOTE = 'SET_NOTE_SEARCH_FULL_NOTE';

export interface CohortNoteSearchAction {
    configuration?: NoteSearchConfiguration;
    datasetId?: string;
    datasets?: PatientListDatasetQuery[];
    dateFilter?: DateBoundary;
    id: number;
    note?: DocumentSearchResult;
    searchResults?: NoteSearchResult;
    searchTerms?: NoteSearchTerm[];
    type: string;
    prefixResults?: RadixTreeResult; 
}

// Asynchronous
export const searchNotesByTerms = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        const { configuration, terms } = state.cohort.noteSearch;
        const config = Object.assign({}, configuration, { pageNumber: 0 });
        dispatch(setNoClickModalState({ message: "Searching", state: NotificationStates.Working }));
        const results = await searchNotes(config, terms);
        dispatch(setNoteSearchResults(results));
        dispatch(setNoteSearchConfiguration(config));
        dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
    };
};

export const getHighlightedNote = (note: DocumentSearchResult) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        const results = await getHighlightedNoteFromResults(note);
        dispatch(setFullNote(results));
    };
};

export const discardHighlightedNote = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        dispatch(setFullNote());
    };
};

/*
export const searchPrefixTerms = (prefix: string) => {  
    return async (dispatch: Dispatch, getState: () => AppState) => {  
        const state = getState();  
        const results = await searchPrefix(prefix);
        dispatch(setNoteSearchPrefixResults(results));  
    };  
} 
*/ 

/*
 * Removes a dataset from note search 
 */
export const removeNoteDataset = (dataset: PatientListDatasetQuery) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        const { noteSearch } = getState().cohort;
        const { configuration, terms } = noteSearch;
        const config = Object.assign({}, configuration);
        config.datasets.delete(dataset.id);

        dispatch(setNoClickModalState({ message: "Deleting", state: NotificationStates.Working }));

        const newDocs = Object.assign({}, getState().cohort.noteSearch);
        newDocs.configuration = Object.assign({}, newDocs.configuration, { pageNumber: 0 });
        
        // Get updated documents
        newDocs.results = await removeDataset(config, dataset, noteSearch.terms);
        const visibleDatasets = await allowDatasetInSearch(dataset.id, true, state.datasets.searchTerm);
        dispatch(setNoteSearchResults(newDocs.results));
        dispatch(setNoteSearchConfiguration(newDocs.configuration));
        dispatch(setDatasetSearchResult(visibleDatasets));
        dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
    };
};

/*
 * Updates note search based on new paginated state.
 */
export const setNoteSearchPagination = (id: number) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const newDocs = Object.assign({}, getState().cohort.noteSearch);
        newDocs.configuration = Object.assign({}, newDocs.configuration, { pageNumber: id });
        
        // Get updated documents
        newDocs.results = await searchNotes(newDocs.configuration, newDocs.terms);

        // Update patient list display based on newest responder results
        dispatch(setNoteSearchResults(newDocs.results));
        dispatch(setNoteSearchConfiguration(newDocs.configuration));
    };
};

export const getNotesDataset = (query: PatientListDatasetQuery, dates?: DateBoundary, panelIndex?: number) => {  
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        const responders: NetworkIdentity[] = [];
        const datasets: NoteDatasetContext[] = [];
        let atLeastOneSucceeded = false;
        let panelIdx = panelIndex;

        dispatch(setNoClickModalState({ message: "Loading Notes", state: NotificationStates.Working }));  

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
                crt.count.state === CohortStateType.LOADED
            ) { responders.push(nr); }
        });

        Promise.all(responders.map((nr: NetworkIdentity, i: number) => { 
            return new Promise( async (resolve, reject) => {
                try {
                    if (nr.isHomeNode || (query.universalId && query.shape !== PatientListDatasetShape.Dynamic)) {
                        const queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;
                        const dataset = await fetchDataset(state, nr, queryId, query, dates, panelIdx);
                        datasets.push({ dataset, responder: nr, query });
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
                const terms = state.cohort.noteSearch.terms;
                const config = Object.assign({}, state.cohort.noteSearch.configuration, { pageNumber: 0 });
                const results = await indexNotes(config, datasets, terms);
                const visibleDatasets = await allowDatasetInSearch(query.id, false, state.datasets.searchTerm);
                config.datasets.set(query.id, query);
                dispatch(setDatasetSearchResult(visibleDatasets));
                dispatch(setNoteSearchResults(results));
                dispatch(setNoteSearchConfiguration(config));
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

export const setNoteSearchPrefixResults = (results: RadixTreeResult): CohortNoteSearchAction => { 
    return  {
        prefixResults: results,
        id: -1,
        type: SET_NOTE_SEARCH_PREFIX_RESULTS
    };
};


// Synchronous
export const setNoteSearchConfiguration = (configuration: NoteSearchConfiguration): CohortNoteSearchAction => {
    return {
        configuration,
        id: -1,
        type: SET_NOTE_SEARCH_CONFIGURATION
    };
};

export const setNoteSearchTerms = (searchTerms: NoteSearchTerm[]): CohortNoteSearchAction => {
    return {
        searchTerms,
        id: -1,
        type: SET_NOTE_SEARCH_TERMS
    };
};

export const setNoteSearchResults = (searchResults: NoteSearchResult): CohortNoteSearchAction => {
    return {
        searchResults,
        id: -1,
        type: SET_NOTE_SEARCH_RESULTS
    };
};

export const setFullNote = (note?: DocumentSearchResult): CohortNoteSearchAction => {
    return {
        note,
        id: -1,
        type: SET_NOTE_SEARCH_FULL_NOTE
    };
};