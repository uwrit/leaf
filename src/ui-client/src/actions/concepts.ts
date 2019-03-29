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
import { fetchConceptAncestorsByConceptIds, fetchConceptAncestorsBySearchTerm, fetchConceptChildren, fetchRootConcepts } from '../services/conceptApi';
import { handleAdminConceptClick } from './admin/concept';
import { sendSearch } from './conceptSearch';

export const SET_CONCEPT = 'SET_CONCEPT';
export const SET_CONCEPTS = 'SET_CONCEPTS';
export const SET_ROOT_CONCEPTS = 'SET_ROOT_CONCEPTS';
export const SET_EXTENSION_CONCEPT = 'SET_EXTENSION_CONCEPT';
export const SET_EXTENSION_CONCEPTS = 'SET_EXTENSION_CONCEPTS';
export const SET_SEARCH_TREE = 'SET_SEARCH_TREE';
export const SET_SELECTED_CONCEPT = 'SET_SELECTED_CONCEPT';
export const REMOVE_CONCEPT = 'REMOVE_CONCEPT';
export const MERGE_EXTENSION_CONCEPTS = 'MERGE_EXTENSION_CONCEPTS';
export const REMOVE_EXTENSION_CONCEPT = 'REMOVE_EXTENSION_CONCEPT';
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
 * Request root concepts and panel filters. Called 
 * only at startup.
 */
export const requestRootConcepts = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const response = await fetchRootConcepts(state);
        const concepts = response.data.concepts as Concept[];
        const panelFilters = response.data.panelFilters as PanelFilter[];
        dispatch(addRootConcepts(concepts));
        dispatch(setPanelFilters(panelFilters));
    };
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
        dispatch(requestConceptChildren(concept));
        const response = await fetchConceptChildren(concept, getState());
        dispatch(receiveConceptChildren(concept, response.data));
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
 * Handle concept clicks (text, not arrow). This causes highlighting,
 * and also fetches full concepts if they are an admin viewing through
 * the Admin Panel.
 */
export const handleConceptClick = (concept: Concept) => {
    return async (dispatch: Dispatch<any>) => {
        dispatch(handleAdminConceptClick(concept));
        dispatch(setSelectedConcept(concept));
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

export const removeExtensionConcept = (concept: Concept) => {
    return {
        concept,
        type: REMOVE_EXTENSION_CONCEPT
    }
};

export const setExtensionConcepts = (conceptMap: ConceptMap, roots: string[]): ConceptsAction => {
    return {
        conceptMap,
        roots,
        type: SET_EXTENSION_CONCEPTS
    };
};

export const mergeExtensionConcepts = (conceptMap: ConceptMap): ConceptsAction => {
    return {
        conceptMap,
        type: MERGE_EXTENSION_CONCEPTS
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