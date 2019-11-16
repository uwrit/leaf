/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { setPanelFilters } from '../actions/panelFilter';
import { AppState, ConceptMap } from '../models/state/AppState';
import { Concept } from '../models/concept/Concept';
import { AggregateConceptHintRef } from '../models/concept/ConceptHint';
import { PanelFilter } from '../models/panel/PanelFilter';
import { fetchConceptAncestorsByConceptIds, fetchConceptAncestorsBySearchTerm, fetchConceptChildren, fetchRootConcepts, fetchConcept } from '../services/conceptApi';
import { fetchAdminConceptIfNeeded } from './admin/concept';
import { Routes, InformationModalState } from '../models/state/GeneralUiState';
import { showInfoModal } from './generalUi';
import { isNonstandard } from '../utils/panelUtils';
import { fetchExtensionConceptChildren, getExtensionRootConcepts } from '../services/queryApi';
import { getAllMetdata } from '../services/dataImport';
import { setImportsMetadata } from './dataImport';

export const SET_CONCEPT = 'SET_CONCEPT';
export const SET_CONCEPTS = 'SET_CONCEPTS';
export const SET_ROOT_CONCEPTS = 'SET_ROOT_CONCEPTS';
export const SET_EXTENSION_CONCEPT = 'SET_EXTENSION_CONCEPT';
export const SET_EXTENSION_ROOT_CONCEPTS = 'SET_EXTENSION_ROOT_CONCEPTS';
export const SET_SEARCH_TREE = 'SET_SEARCH_TREE';
export const SET_SELECTED_CONCEPT = 'SET_SELECTED_CONCEPT';
export const CREATE_CONCEPT = 'CREATE_CONCEPT';
export const REPARENT_CONCEPT = 'REPARENT_CONCEPT';
export const SWITCH_CONCEPTS = 'SWITCH_CONCEPTS';
export const REMOVE_CONCEPT = 'REMOVE_CONCEPT';
export const DELETE_ALL_EXTENSION_CONCEPTS = 'DELETE_ALL_EXTENSION_CONCEPTS';
export const ERROR_CONCEPTS = 'ERROR_CONCEPTS';
export const TOGGLE_CONCEPT_OPEN = 'TOGGLE_CONCEPT_OPEN';
export const REQUEST_CONCEPT_CHILDREN = 'REQUEST_CONCEPT_CHILDREN';
export const REQUEST_SEARCH_TREE = 'REQUEST_SEARCH_TREE';
export const RECEIVE_CONCEPT_CHILDREN = 'RECEIVE_CONCEPT_CHILDREN';
export const SHOW_SEARCH_TREE = 'SHOW_SEARCH_TREE';
export const SHOW_DRILL_TREE = 'SHOW_DRILL_TREE';

export interface ConceptsAction {
    conceptMap?: ConceptMap;
    children?: Concept[];
    concept?: Concept;
    concepts?: Concept[];
    parentId?: string;
    error?: string;
    roots?: string[];
    tree?: number[];
    type: string;
}

/*
 * Determine if children should be remotely fetched.
 */
const shouldfetchConceptChildren = (concept: Concept): boolean => {
    return concept.isParent && !concept.childrenLoaded && !concept.isFetching;
};

// Async actions
/*
 * Request root concepts and panel filters. Called at startup.
 */
export const requestRootConcepts = async (dispatch: any, getState: () => AppState) => {
    const state = getState();
    const response = await fetchRootConcepts(state);
    const concepts = response.data.concepts as Concept[];
    const panelFilters = response.data.panelFilters as PanelFilter[];
    dispatch(addRootConcepts(concepts));
    dispatch(setPanelFilters(panelFilters));
};

/*
 * Fetch concept children, whether remotely or by
 * loading already cached concepts.
 */
export const fetchConceptChildrenIfNeeded = (concept: Concept) => {
    return (dispatch: any) => {
        if (shouldfetchConceptChildren(concept)) {
            dispatch(getConceptChildren(concept));
        }
        else if (concept.childrenLoaded) {
            dispatch(toggleConceptOpen(concept));
        }
    };
};

/*
 * Fetch concept children remotely.
 */
export const getConceptChildren = (concept: Concept) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const isStandard = !isNonstandard(concept.universalId);
        const state = getState();
        dispatch(requestConceptChildren(concept));

        if (isStandard) {
            const response = await fetchConceptChildren(concept, state);
            dispatch(receiveConceptChildren(concept, response.data));
        } else {

            /*
             * If a Saved Query or REDCap import root concept, load from server.
             */
            if (concept.isRoot && state.dataImport.enabled && !state.dataImport.loaded) {
                const imports = await getAllMetdata(state);
                const extensionConcepts = await getExtensionRootConcepts(state.dataImport, imports, [ ...state.queries.saved.values() ]);
                dispatch(setExtensionRootConcepts(extensionConcepts));
                dispatch(setImportsMetadata(imports));
            };
            const response = await fetchExtensionConceptChildren(concept);
            dispatch(receiveConceptChildren(concept, response));
        }
    };
};

/*
 * Fetch new search concept tree based on a user-selected hint.
 */
export const fetchSearchTreeFromConceptHint = (hint: AggregateConceptHintRef) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        try {
            dispatch(setSearchTreeRequested());
            const response = await fetchConceptAncestorsByConceptIds(hint.ids, getState());
            dispatch(setSearchTree(response.data.concepts));
        } catch (err) {
            console.log(err);
            dispatch(setSearchTree([]));
        }
    };
};

/*
 * Fetch new search concept tree based on a search term. Called
 * when user hits 'enter' and no exactly-matching hint is found.
 */
export const fetchSearchTreeFromTerms = (term: string) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        try {
            dispatch(setSearchTreeRequested());
            const response = await fetchConceptAncestorsBySearchTerm(term, getState());
            dispatch(setSearchTree(response.data));
        } catch (err) {
            console.log(err);
            dispatch(setSearchTree([]));
        }
    };
};

/*
 * Fetch a single concept.
 */
export const fetchSingleConcept = (id: string) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        try {
            const response = await fetchConcept(getState(), id);
            dispatch(setConcept(response));
        } catch (err) {
            console.log(err);
        }
    };
};

/*
 * Handle concept clicks (text, not arrow). This causes highlighting,
 * and also fetches full concepts if they are an admin viewing through
 * the Admin Panel.
 */
export const handleConceptClick = (concept: Concept) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        /*
         * If user is not an admin and current route is not the Admin Panel,
         * set the current Concept to 'selected' and peace out.
         */
        if (!state.auth.userContext!.isAdmin || state.generalUi.currentRoute !== Routes.AdminPanel) { 
            dispatch(setSelectedConcept(concept));
            return;
        }

        /*
         * If there are changes and user is switching to new Concept,
         * prevent switch to the new Concept until a save is completed or changes discarded.
         */
        const { changed, currentAdminConcept } = state.admin!.concepts;
        if (currentAdminConcept && currentAdminConcept.id === concept.id) {
            dispatch(setSelectedConcept(concept));
        }
        else if (changed || concept.unsaved) {
            const info: InformationModalState = {
                body: "Please save or undo your current changes first.",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        }
        
        /*
         * Else switch to the new concept.
         */
        else {
            dispatch(setSelectedConcept(concept));
            dispatch(fetchAdminConceptIfNeeded(concept));
        }
    };
};

// Synchronous actions
export const setSearchTree = (concepts: Concept[]): ConceptsAction => {
    return {
        concepts,
        type: SET_SEARCH_TREE
    };
};

export const setSearchTreeRequested = (): ConceptsAction => {
    return {
        type: REQUEST_SEARCH_TREE
    };
};

export const showDrillTree = (): ConceptsAction => {
    return {
        type: SHOW_DRILL_TREE
    };
};

export const toggleConceptOpen = (concept: Concept): ConceptsAction => {
    return {
        concept,
        type: TOGGLE_CONCEPT_OPEN
    };
};

export const requestConceptChildren = (concept: Concept): ConceptsAction => {
    return {
        concept,
        type: REQUEST_CONCEPT_CHILDREN
    };
};

export const receiveConceptChildren = (concept: Concept, children: Concept[]): ConceptsAction => {
    return {
        children,
        concept,
        type: RECEIVE_CONCEPT_CHILDREN
    };
};

export const setConcept = (concept: Concept): ConceptsAction => {
    return {
        concepts: [ concept ],
        type: SET_CONCEPT
    };
};

export const addConcepts = (concepts: Concept[]): ConceptsAction => {
    return {
        concepts,
        type: SET_CONCEPTS
    };
};

export const switchConcepts = (oldConcept: Concept, newConcept: Concept): ConceptsAction => {
    return {
        concepts: [ oldConcept, newConcept ],
        type: SWITCH_CONCEPTS
    };
};

export const addRootConcepts = (concepts: Concept[]): ConceptsAction => {
    return {
        concepts,
        type: SET_ROOT_CONCEPTS
    };
};

export const setExtensionConcept = (concept: Concept) => {
    return {
        concept,
        type: SET_EXTENSION_CONCEPT
    }
};

export const deleteAllExtensionConcepts = () => {
    return {
        type: DELETE_ALL_EXTENSION_CONCEPTS
    }
};

export const setExtensionRootConcepts = (concepts: Concept[]): ConceptsAction => {
    return {
        concepts,
        type: SET_EXTENSION_ROOT_CONCEPTS
    };
};

export const setSelectedConcept = (concept: Concept): ConceptsAction => {
    return {
        concept,
        type: SET_SELECTED_CONCEPT
    }
}

export const errorConcepts = (error: string): ConceptsAction => {
    return {
        error,
        type: ERROR_CONCEPTS
    };
};

export const removeConcept = (concept: Concept): ConceptsAction => {
    return {
        concept,
        type: REMOVE_CONCEPT
    };
};

export const reparentConcept = (concept: Concept, parentId: string): ConceptsAction  => {
    return {
        concept,
        parentId,
        type: REPARENT_CONCEPT
    }
};

export const createConcept = (concept: Concept): ConceptsAction  => {
    return {
        concept,
        type: CREATE_CONCEPT
    }
};