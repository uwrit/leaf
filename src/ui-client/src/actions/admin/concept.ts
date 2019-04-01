/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept } from '../../models/admin/Concept';
import { Concept as UserConcept } from '../../models/concept/Concept';
import { Concept as AdminConcept } from '../../models/admin/Concept';
import { AppState } from '../../models/state/AppState';
import { Routes, InformationModalState, NoClickModalStates } from '../../models/state/GeneralUiState';
import { getAdminConcept, updateAdminConcept, createAdminConcept, deleteAdminConcept } from '../../services/admin/conceptApi';
import { isEmbeddedQuery } from '../../utils/panelUtils';
import { AdminPanelLoadState, AdminPanelConceptEditorPane } from '../../models/state/AdminState';
import { showInfoModal, setNoClickModalState } from '../generalUi';
import { getSqlSets } from '../../services/admin/sqlSetApi';
import { getAdminSqlConfiguration } from './configuration';
import { generateSampleSql } from '../../utils/admin';
import { setConcept, removeConcept, fetchSingleConcept } from '../concepts';
import { setAdminConceptSqlSets } from './sqlSet';
import { fetchConcept } from '../../services/conceptApi'

export const SET_ADMIN_CONCEPT = 'SET_ADMIN_CONCEPT';
export const SET_ADMIN_CONCEPT_EXAMPLE_SQL = 'SET_ADMIN_CONCEPT_EXAMPLE_SQL';
export const SET_ADMIN_PANEL_LOAD_STATE = 'SET_ADMIN_PANEL_LOAD_STATE';
export const SET_ADMIN_PANEL_CONCEPT_LOAD_STATE = 'SET_ADMIN_PANEL_CONCEPT_LOAD_STATE';
export const SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE = 'SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE';
export const SET_ADMIN_PANEL_CURRENT_USER_CONCEPT = 'SET_ADMIN_PANEL_CURRENT_USER_CONCEPT';
export const CREATE_ADMIN_CONCEPT = 'CREATE_ADMIN_CONCEPT';

export interface AdminConceptAction {
    adminConcept?: AdminConcept;
    changed?: boolean;
    pane?: AdminPanelConceptEditorPane;
    sql?: string;
    state?: AdminPanelLoadState;
    userConcept?: UserConcept;
    type: string;
}

// Asynchronous
export const revertAdminAndUserConceptChanges = (adminConcept: AdminConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            dispatch(setNoClickModalState({ message: "Undoing", state: NoClickModalStates.CallingServer }));
            const state = getState();
            const serverAdminConcept = await getAdminConcept(state, adminConcept.id);
            const serverUserConceptResp = await fetchConcept(state, adminConcept.id);
            const serverUserConcept = serverUserConceptResp.data as UserConcept;
            dispatch(setConcept(serverUserConcept));
            dispatch(setAdminConcept(serverAdminConcept, false));
            dispatch(setAdminPanelCurrentUserConcept(serverUserConcept));
        } catch (err) {
            console.log(err);
        }
        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
    };
};

/*
 * Fetch full concept if user is admin and it hasn't
 * already been loaded.
 */
export const fetchAdminConceptIfNeeded = (userConcept: UserConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            const adm = state.admin!.concepts;
            const embedded = isEmbeddedQuery(userConcept.universalId);
            dispatch(setAdminPanelCurrentUserConcept(userConcept));

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
                let admConcept = adm.concepts.get(userConcept.id);

                /*
                * If not previously loaded, fetch from server.
                */ 
                if (!admConcept) {
                    dispatch(setAdminPanelConceptLoadState(AdminPanelLoadState.LOADING));
                    admConcept = await getAdminConcept(state, userConcept.id);
                } 
                
                const sqlConfig = state.admin!.configuration.sql;
                const sqlSet = state.admin!.sqlSets.sets.get(admConcept!.sqlSetId!)!;
                const sql = generateSampleSql(admConcept!, sqlSet, sqlConfig);
                dispatch(setAdminConcept(admConcept!, false));
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
                dispatch(setAdminConceptSqlSets(sqlSets, false));
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
export const handleAdminConceptClick = (newConcept: UserConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        if (newConcept.unsaved) { return; }
        const state = getState();
        const { changed, currentAdminConcept } = state.admin!.concepts
        /*
         * If user is an admin and current route is Admin Panel, proceed.
         */
        if (!state.auth.userContext!.isAdmin || state.generalUi.currentRoute !== Routes.AdminPanel) { return; }
        
        /*
         * If there are changes and user is switching to new concept,
         * check to see if they want to save.
         */
        if (changed && currentAdminConcept!.id !== newConcept.id) {
            const info: InformationModalState = {
                body: "Please save or undo your current changes first.",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
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
export const saveNewAdminConcept = (concept: Concept, userConcept: UserConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Saving", state: NoClickModalStates.CallingServer }));
            createAdminConcept(state, concept)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Concept Saved", state: NoClickModalStates.Complete }));
                        dispatch(setAdminConcept(concept, false));
                        dispatch(setConcept(userConcept));
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
export const saveAdminConcept = (concept: Concept) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Updating", state: NoClickModalStates.CallingServer }));
            updateAdminConcept(state, concept)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Concept Updated", state: NoClickModalStates.Complete }));
                        dispatch(setAdminConcept(concept, false));
                        dispatch(fetchSingleConcept(concept.id));
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
export const deleteAdminConceptFromServer = (concept: Concept, userConcept: UserConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
            deleteAdminConcept(state, concept.id)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Concept Deleted", state: NoClickModalStates.Complete }));
                        dispatch(removeConcept(userConcept));
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

/*
 * Handles switching between Admin Panel views. Prevents
 * view pane changes if admin has unsaved Concept changes.
 */
export const checkIfAdminPanelUnsavedAndSetPane = (pane: AdminPanelConceptEditorPane) => {
    return async (dispatch: any, getState: () => AppState) => {
        const admin = getState().admin!;
        if (admin.concepts.changed || admin.sqlSets.changed) {
            const info: InformationModalState = {
                body: "Please save or undo your current changes first.",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        } else {
            dispatch(setAdminPanelConceptEditorPane(pane));
        }
    };
};

// Synchronous
export const setAdminConcept = (adminConcept: AdminConcept, changed: boolean): AdminConceptAction => {
    return {
        adminConcept,
        changed,
        type: SET_ADMIN_CONCEPT
    };
};

export const setAdminPanelCurrentUserConcept = (userConcept: UserConcept): AdminConceptAction => {
    return {
        userConcept,
        type: SET_ADMIN_PANEL_CURRENT_USER_CONCEPT
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

export const setAdminPanelConceptEditorPane = (pane: AdminPanelConceptEditorPane): AdminConceptAction => {
    return {
        pane,
        type: SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE
    };
};

export const createNewAdminConcept = (adminConcept: AdminConcept): AdminConceptAction => {
    return {
        adminConcept,
        type: CREATE_ADMIN_CONCEPT
    };
};