/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept, ConceptDeleteResponse } from '../../models/admin/Concept';
import { Concept as UserConcept } from '../../models/concept/Concept';
import { Concept as AdminConcept } from '../../models/admin/Concept';
import { AppState } from '../../models/state/AppState';
import { InformationModalState, NoClickModalStates, ConfirmationModalState } from '../../models/state/GeneralUiState';
import { getAdminConcept, updateAdminConcept, createAdminConcept, deleteAdminConcept } from '../../services/admin/conceptApi';
import { isEmbeddedQuery } from '../../utils/panelUtils';
import { AdminPanelLoadState, AdminPanelConceptEditorPane } from '../../models/state/AdminState';
import { showInfoModal, setNoClickModalState, showConfirmationModal } from '../generalUi';
import { getSqlSets } from '../../services/admin/sqlSetApi';
import { getAdminSqlConfiguration } from './configuration';
import { generateSampleSql, getRootId } from '../../utils/admin';
import { setConcept, removeConcept, reparentConcept, createConcept } from '../concepts';
import { setAdminConceptSqlSets } from './sqlSet';
import { fetchConcept } from '../../services/conceptApi'

export const SET_ADMIN_CONCEPT = 'SET_ADMIN_CONCEPT';
export const SET_ADMIN_CONCEPT_EXAMPLE_SQL = 'SET_ADMIN_CONCEPT_EXAMPLE_SQL';
export const SET_ADMIN_PANEL_LOAD_STATE = 'SET_ADMIN_PANEL_LOAD_STATE';
export const SET_ADMIN_PANEL_CONCEPT_LOAD_STATE = 'SET_ADMIN_PANEL_CONCEPT_LOAD_STATE';
export const SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE = 'SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE';
export const SET_ADMIN_PANEL_CURRENT_USER_CONCEPT = 'SET_ADMIN_PANEL_CURRENT_USER_CONCEPT';
export const CREATE_ADMIN_CONCEPT = 'CREATE_ADMIN_CONCEPT';
export const REMOVE_UNSAVED_ADMIN_CONCEPT = 'REMOVE_UNSAVED_ADMIN_CONCEPT';

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
export const revertAdminAndUserConceptChanges = (adminConcept: AdminConcept, userConcept: UserConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            dispatch(setNoClickModalState({ message: "Undoing", state: NoClickModalStates.CallingServer }));
            const state = getState();
            const serverAdminConcept = await getAdminConcept(state, adminConcept.id);
            const serverUserConcept = await fetchConcept(state, adminConcept.id);
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
 * Handle an admin dropping a Concept within a new Concept.
 */
export const handleReparentDrop = (userConcept: UserConcept, parentId: string) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        /*
         * Short-circuit if for some reason a non-admin was able to do this or
         * it's the current parent.
         */
        if (!state.admin || parentId === userConcept.parentId) { return; }

        /*
         * If a newly-created Concept not saved in server, allow direct reparenting.
         */
        if (userConcept.unsaved) {
            dispatch(reparentConcept(userConcept, parentId));
            const currentTree = getState().concepts.currentTree;
            const reparented = currentTree.get(userConcept.id)!;
            const adminConcept = Object.assign({}, state.admin!.concepts.concepts.get(userConcept.id), { parentId, rootId: reparented.rootId });
            dispatch(setAdminConcept(adminConcept, true));
            dispatch(setAdminPanelCurrentUserConcept(reparented!));

        } else {

            /*
             * Load the Admin Concept if not already cached.
             */
            const newParent = state.concepts.currentTree.get(parentId)!;
            const newRootId = getRootId(newParent, getState().concepts.currentTree);
            let adminConcept = Object.assign({}, state.admin!.concepts.currentAdminConcept, { parentId, rootId: newRootId });
            if (!state.admin!.concepts.currentAdminConcept) {
                dispatch(setNoClickModalState({ message: "Loading", state: NoClickModalStates.CallingServer }));
                adminConcept =  Object.assign({}, await getAdminConcept(state, userConcept.id), { parentId, newRootId });
                dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Complete }));
            }

            /*
             * Confirm that the move was intentional, and save to server if 'yes'.
             */
            const confirm: ConfirmationModalState = {
                body: `Are you sure you want to move "${adminConcept.uiDisplayName}" under "${newParent.uiDisplayName}"? `+
                      `This will take effect immediately and be visible to users`,
                header: 'Re-parent Concept',
                onClickNo: () => null,
                onClickYes: () => dispatch(saveAdminConcept(adminConcept, userConcept)),
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, move the Concept`
            };
            dispatch(showConfirmationModal(confirm));
        }
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

            /*
             * Don't request from server if this is a newly-created Concept.
             */
            if (userConcept.unsaved) { return; }

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
 * Save a new concept.
 */
export const saveAdminConcept = (adminConcept: Concept, userConcept: UserConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NoClickModalStates.CallingServer }));
            const newAdminConcept = adminConcept.unsaved
                ? await createAdminConcept(state, adminConcept)
                : await updateAdminConcept(state, adminConcept);
            const newUserConcept = await fetchConcept(state, newAdminConcept.id);

            dispatch(removeConcept(userConcept));
            dispatch(createConcept(newUserConcept));
            dispatch(setAdminConcept(newAdminConcept, false));
            dispatch(setAdminPanelCurrentUserConcept(newUserConcept));
            
            /*
             * Update parent Concept if needed.
             */
            await updateAdminParentOnSaveIfNeeded(newAdminConcept, newUserConcept, getState());
            dispatch(setNoClickModalState({ message: "Saved", state: NoClickModalStates.Complete }));
        } catch (err) {
            console.log(err);
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            const info: InformationModalState = {
                body: "An error occurred while attempting to save the Concept. Please see the Leaf error logs for details.",
                header: "Error Saving Concept",
                show: true
            };
            dispatch(showInfoModal(info));
        }
    }
};

/*
 * After saving an Admin Concept, if the parent has only
 * one child 'IsParent' in the DB may not be set, so set
 * it here behind the scenes just to be safe (else when users
 * log in the newly-saved Concept may be hidden).
 */
export const updateAdminParentOnSaveIfNeeded = async (adminConcept: Concept, userConcept: UserConcept, state: AppState) => {
    if (adminConcept.parentId && userConcept.parentId) {
        const adminParentConcept = state.admin!.concepts.concepts.get(adminConcept.parentId);
        const userParentConcept = state.concepts.currentTree.get(userConcept.parentId);
        if (adminParentConcept && userParentConcept) {
            if (userParentConcept.childrenIds && userParentConcept.childrenIds.size === 1) {
                const parent = Object.assign({}, adminParentConcept, { isParent: true });
                await updateAdminConcept(state, parent);
            }
        }
    }
};

/*
 * Delete a existing concept.
 */
export const deleteAdminConceptFromServer = (concept: Concept, userConcept: UserConcept) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
        deleteAdminConcept(state, concept.id)
            .then(
                response => {
                    dispatch(setNoClickModalState({ message: "Concept Deleted", state: NoClickModalStates.Complete }));
                    dispatch(removeConcept(userConcept));
                }, error => {
                    const info: InformationModalState = {
                        body: "",
                        header: "Error Deleting Concept",
                        show: true
                    };
                    if (error.response.status === 409) {
                        const conflicts = error.response.data as ConceptDeleteResponse;
                        info.body = 
                            `There are ${conflicts.conceptCount} descendent Concept(s), ${conflicts.panelFilterCount} filter(s), ` + 
                            `and ${conflicts.queryCount} saved user querie(s) which depend on this. Please delete these first.`;
                    } else {
                        info.body = "An error occurred while attempting to delete the Concept. Please see the Leaf error logs for details.";
                    }
                    dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                    dispatch(showInfoModal(info));
                }
            );
        
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

export const removeUnsavedAdminConcept = (): AdminConceptAction => {
    return {
        type: REMOVE_UNSAVED_ADMIN_CONCEPT
    };
};