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
import { AdminPanelLoadState } from '../../models/state/AdminState';
import { showInfoModal, setNoClickModalState, showConfirmationModal } from '../generalUi';
import { generateSampleSql, getRootId } from '../../utils/admin/concept';
import { setConcept, removeConcept, reparentConcept, switchConcepts } from '../concepts';
import { fetchConcept } from '../../services/conceptApi'

export const SET_ADMIN_CONCEPT = 'SET_ADMIN_CONCEPT';
export const SET_ADMIN_CONCEPT_EXAMPLE_SQL = 'SET_ADMIN_CONCEPT_EXAMPLE_SQL';
export const SET_ADMIN_PANEL_CONCEPT_LOAD_STATE = 'SET_ADMIN_PANEL_CONCEPT_LOAD_STATE';
export const SET_ADMIN_PANEL_CURRENT_USER_CONCEPT = 'SET_ADMIN_PANEL_CURRENT_USER_CONCEPT';
export const RESET_ADMIN_CONCEPT_CACHE = 'RESET_ADMIN_CONCEPT_CACHE';
export const CREATE_ADMIN_CONCEPT = 'CREATE_ADMIN_CONCEPT';
export const REMOVE_UNSAVED_ADMIN_CONCEPT = 'REMOVE_UNSAVED_ADMIN_CONCEPT';

export interface AdminConceptAction {
    adminConcept?: AdminConcept;
    changed?: boolean;
    sql?: string;
    state?: AdminPanelLoadState;
    userConcept?: UserConcept;
    type: string;
}

interface AdminParentSavePayload {
    adminParentConcept: Concept;
    userParentConcept: UserConcept;
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
        dispatch(setNoClickModalState({ state: NoClickModalStates.Hidden }));
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
                const serverAdminConcept = await getAdminConcept(state, userConcept.id);
                adminConcept =  Object.assign({}, serverAdminConcept, { parentId, rootId: newRootId });
                dispatch(setNoClickModalState({ state: NoClickModalStates.Complete }));
            }

            /*
             * Confirm that the move was intentional, and save to server if 'yes'.
             */
            const confirm: ConfirmationModalState = {
                body: `Are you sure you want to move "${adminConcept.uiDisplayName}" under "${newParent.uiDisplayName}"? `+
                      `This will take effect immediately and be visible to users`,
                header: 'Re-parent Concept',
                onClickNo: () => null,
                onClickYes: () => {
                    dispatch(saveAdminConcept(adminConcept, userConcept));
                    dispatch(resetAdminConceptCache());
                },
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

            /*
             * Update changed Concept.
             */
            dispatch(switchConcepts(userConcept, newUserConcept));
            dispatch(setAdminPanelCurrentUserConcept(newUserConcept));

            /*
             * Update parent Concept if needed.
             */
            const parent = await shouldUpdateAdminParentConcept(newUserConcept, getState());
            if (parent) {
                dispatch(setConcept(parent.userParentConcept));
                dispatch(setAdminConcept(parent.adminParentConcept, false));
                await updateAdminConcept(state, parent.adminParentConcept);
            }
            dispatch(setAdminConcept(newAdminConcept, false));

            dispatch(setNoClickModalState({ message: "Saved", state: NoClickModalStates.Complete }));
        } catch (err) {
            console.log(err);
            dispatch(setNoClickModalState({ state: NoClickModalStates.Hidden }));
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
 * After saving an Admin Concept, if the parent has just had a child parented to it
 * and it was not previously a parent, [IsParent] in the DB may not be set. If so, set
 * it here behind the scenes just to be safe (else when users log in the newly-saved Concept may be hidden).
 */
export const shouldUpdateAdminParentConcept = async (userConcept: UserConcept, state: AppState): Promise<AdminParentSavePayload | undefined> => {
    if (userConcept.parentId) {
        const userParentConcept = state.concepts.currentTree.get(userConcept.parentId);
        if (userParentConcept && userParentConcept.childrenIds) {
            const adminParent = await getAdminConcept(state, userConcept.parentId);
            const copyAdminParent = Object.assign({}, adminParent, { isParent: true });
            const copyUserParent = Object.assign({}, userParentConcept, { isParent: true });
            return { 
                adminParentConcept: copyAdminParent,
                userParentConcept: copyUserParent
            }
        }
    }
    return;
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
                    dispatch(setNoClickModalState({ state: NoClickModalStates.Hidden }));
                    dispatch(showInfoModal(info));
                }
            );
        
    }
};

// Synchonous
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

export const resetAdminConceptCache = (): AdminConceptAction => {
    return {
        type: RESET_ADMIN_CONCEPT_CACHE
    };
};