/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept } from '../../models/admin/Concept';
import { Concept as UiConcept } from '../../models/concept/Concept';
import { AppState } from '../../models/state/AppState';
import { Routes, InformationModalState, NoClickModalStates, ConfirmationModalState } from '../../models/state/GeneralUiState';
import { getConcept, updateConcept, createConcept, deleteConcept } from '../../services/admin/conceptApi';
import { isEmbeddedQuery } from '../../utils/panelUtils';
import { AdminPanelLoadState, AdminPanelConceptEditorPane } from '../../models/state/AdminState';
import { showInfoModal, setNoClickModalState, showConfirmationModal } from '../generalUi';
import { getSqlSets } from '../../services/admin/sqlSetApi';
import { getSpecializationGroups } from '../../services/admin/specializationGroupApi';
import { getAdminSqlConfiguration } from './configuration';
import { generateSampleSql } from '../../utils/admin';
import { setConcept, removeConcept } from '../concepts';
import { setAdminConceptSqlSets } from './sqlSet';
import { setAdminConceptSpecializationGroups } from './specializationGroup';

export const SET_ADMIN_CONCEPT = 'SET_ADMIN_CONCEPT';
export const SET_ADMIN_CONCEPT_ORIGINAL = 'SET_ADMIN_CONCEPT_ORIGINAL'
export const SET_ADMIN_CONCEPT_EXAMPLE_SQL = 'SET_ADMIN_CONCEPT_EXAMPLE_SQL';
export const SET_ADMIN_PANEL_LOAD_STATE = 'SET_ADMIN_PANEL_LOAD_STATE';
export const SET_ADMIN_PANEL_CONCEPT_LOAD_STATE = 'SET_ADMIN_PANEL_CONCEPT_LOAD_STATE';
export const SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE = 'SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE';
export const REVERT_ADMIN_CONCEPT_TO_ORIGINAL = 'REVERT_ADMIN_CONCEPT_TO_ORIGINAL';

export interface AdminConceptAction {
    changed?: boolean;
    concept?: Concept;
    pane?: AdminPanelConceptEditorPane;
    uiConcept?: UiConcept;
    sql?: string;
    state?: AdminPanelLoadState;
    type: string;
}

// Asynchronous
/*
 * Fetch full concept if user is admin and it hasn't
 * already been loaded.
 */
export const fetchAdminConceptIfNeeded = (concept: UiConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            const adm = state.admin!.concepts;
            const uiConcept = state.concepts.currentTree.get(concept.id)!;
            const embedded = isEmbeddedQuery(concept.universalId);
            dispatch(setAdminConceptOriginal(uiConcept));

            /*
             * If an embedded query, don't fetch.
             */
            if (embedded) {
                dispatch(setAdminPanelConceptLoadState(AdminPanelLoadState.NOT_APPLICABLE));
            } 
            else {
                /*
                * Try to load from local cache.
                */ 
                let admConcept = adm.concepts.get(concept.id);

                /*
                * If not previously loaded, fetch from server.
                */ 
                if (!admConcept) {
                    dispatch(setAdminPanelConceptLoadState(AdminPanelLoadState.LOADING));
                    admConcept = await getConcept(state, concept.id);
                } 
                
                const sqlConfig = state.admin!.configuration.sql;
                const sqlSet = state.admin!.sqlSets.sets.get(admConcept.sqlSetId)!;
                const sql = generateSampleSql(admConcept, sqlSet, sqlConfig);
                dispatch(setAdminConcept(admConcept, false));
                dispatch(setAdminConceptExampleSql(sql));
            }
        } catch (err) {
            const info : InformationModalState = {
                header: "Error Loading Concept",
                body: "Leaf encountered an error while attempting to fetch a Concept. Check the Leaf log file for details.",
                show: true
            }
            dispatch(showInfoModal(info));
            dispatch(setAdminPanelConceptLoadState(AdminPanelLoadState.ERROR));
        }
    };
};

/*
 * Fetch Admin Panel data if it hasn't already been loaded.
 */
export const loadAdminPanelDataIfNeeded = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        if (state.auth.userContext!.isAdmin && state.admin!.state === AdminPanelLoadState.NOT_LOADED) {
            try {
                dispatch(setNoClickModalState({ message: "Loading", state: NoClickModalStates.CallingServer }));

                /*
                 * Load Leaf instance configuration.
                 */
                dispatch(getAdminSqlConfiguration());

                /*
                 * Load Concept-related data.
                 */ 
                const sqlSets = await getSqlSets(state);
                dispatch(setAdminConceptSqlSets(sqlSets));
                dispatch(setAdminPanelLoadState(AdminPanelLoadState.LOADED));
                dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            } catch (err) {
                const info: InformationModalState = {
                    body: "Leaf encountered an error while attempting to load Admin data. Please check the Leaf log files for more information.",
                    header: "Error Loading Admin Data",
                    show: true
                };
                dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                dispatch(showInfoModal(info));
            }
        }
    };
};

/*
 * Handle clicks on concepts. Only proceeds if the
 * user is an admin and they are currently in the in 
 * Admin Panel.
 */
export const handleAdminConceptClick = (newConcept: UiConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const { changed, currentConcept } = state.admin!.concepts
        /*
         * If user is an admin and current route is Admin Panel, proceed.
         */
        if (!state.auth.userContext!.isAdmin || state.generalUi.currentRoute !== Routes.AdminPanel) { return; }
        
        /*
         * If there are changes and user is switching to new concept,
         * check to see if they want to save.
         */
        if (changed && currentConcept!.id !== newConcept.id) {
            const confirm: ConfirmationModalState = {
                body: `Do you want to save changes to the current concept, "${currentConcept!.uiDisplayName}?"`,
                header: 'Save Changes',
                onClickNo: () => { dispatch(revertAdminConceptToOriginal()); dispatch(fetchAdminConceptIfNeeded(newConcept)); },
                onClickYes: () => { dispatch(saveAdminConcept(currentConcept!, newConcept)) },
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, I'll Save Changes`
            };
            dispatch(showConfirmationModal(confirm));
        } 
        /*
         * Else load the new concept.
         */
        else {
            dispatch(fetchAdminConceptIfNeeded(newConcept));
        }
    };
};

/*
 * Save a new concept.
 */
export const saveNewAdminConcept = (concept: Concept, uiConcept: UiConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Saving", state: NoClickModalStates.CallingServer }));
            createConcept(state, concept)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Concept Saved", state: NoClickModalStates.Complete }));
                        dispatch(setAdminConcept(concept, false));
                        dispatch(setConcept(uiConcept));
                },  error => {
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to save the Concept. Please see the Leaf error logs for details.",
                            header: "Error Saving Concept",
                            show: true
                        };
                        dispatch(showInfoModal(info));
                });
        } catch (err) {
            console.log(err);
        }
    }
};

/*
 * Update an existing concept.
 */
export const saveAdminConcept = (concept: Concept, uiConcept: UiConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Updating", state: NoClickModalStates.CallingServer }));
            updateConcept(state, concept)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Concept Updated", state: NoClickModalStates.Complete }));
                        dispatch(setAdminConcept(concept, false));
                        dispatch(setConcept(uiConcept));
                },  error => {
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to update the Concept. Please see the Leaf error logs for details.",
                            header: "Error Updating Concept",
                            show: true
                        };
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        dispatch(showInfoModal(info));
                });
        } catch (err) {
            console.log(err);
        }
    }
};

/*
 * Delete a existing concept.
 */
export const deleteAdminConcept = (concept: Concept, uiConcept: UiConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
            deleteConcept(state, concept.id)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Concept Deleted", state: NoClickModalStates.Complete }));
                        dispatch(removeConcept(uiConcept));
                },  error => {
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Concept. Please see the Leaf error logs for details.",
                            header: "Error Deleting Concept",
                            show: true
                        };
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        dispatch(showInfoModal(info));
                });
        } catch (err) {
            console.log(err);
        }
    }
};

// Synchronous
export const setAdminConcept = (concept: Concept, changed: boolean): AdminConceptAction => {
    return {
        concept,
        changed,
        type: SET_ADMIN_CONCEPT
    };
};

export const setAdminConceptOriginal = (uiConcept: UiConcept): AdminConceptAction => {
    return {
        uiConcept,
        type: SET_ADMIN_CONCEPT_ORIGINAL
    };
};

export const setAdminPanelLoadState = (state: AdminPanelLoadState): AdminConceptAction => {
    return {
        state,
        type: SET_ADMIN_PANEL_LOAD_STATE
    };
};

export const setAdminPanelConceptLoadState = (state: AdminPanelLoadState): AdminConceptAction => {
    return {
        state,
        type: SET_ADMIN_PANEL_CONCEPT_LOAD_STATE
    };
};

export const setAdminConceptExampleSql = (sql: string): AdminConceptAction => {
    return {
        sql,
        type: SET_ADMIN_CONCEPT_EXAMPLE_SQL
    };
};

export const revertAdminConceptToOriginal = (): AdminConceptAction => {
    return {
        type: REVERT_ADMIN_CONCEPT_TO_ORIGINAL
    };
};

export const setAdminPanelConceptEditorPane = (pane: AdminPanelConceptEditorPane): AdminConceptAction => {
    return {
        pane,
        type: SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE
    };
};