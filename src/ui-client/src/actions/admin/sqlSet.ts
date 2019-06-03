/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { ConceptSqlSet, ConceptSqlSetDeleteResponse } from "../../models/admin/Concept";
import { getSqlSets, createSqlSet, deleteSqlSet, updateSqlSet } from "../../services/admin/sqlSetApi";
import { setNoClickModalState, showInfoModal } from "../generalUi";
import { NoClickModalStates, InformationModalState } from "../../models/state/GeneralUiState";
import { getApiUpdateQueue } from "../../utils/admin/concept";

export const SET_ADMIN_SQL_SETS = 'SET_ADMIN_SQL_SETS';
export const SET_ADMIN_UNEDITED_SQL_SETS = 'SET_ADMIN_UNEDITED_SQL_SETS';
export const SET_ADMIN_SQL_SETS_UNCHANGED = 'SET_ADMIN_SQL_SETS_UNCHANGED';
export const SYNC_ADMIN_SQL_SET_UNSAVED_WITH_SAVED = 'SYNC_ADMIN_SQL_SET_UNSAVED_WITH_SAVED';
export const REMOVE_ADMIN_SQL_SET = 'REMOVE_ADMIN_SQL_SET';
export const UNDO_ADMIN_SQL_SET_CHANGES = 'UNDO_ADMIN_SQL_SET_CHANGES';

export interface AdminSqlSetAction {
    changed?: boolean;
    id?: string | number;
    prevSqlSet?: ConceptSqlSet;
    set?: ConceptSqlSet;
    sets?: ConceptSqlSet[];
    mappedSets?: Map<number,ConceptSqlSet>
    type: string;
}

// Asynchronous
/*
 * Process all queued Concept SQL Set/Specialization/Specialization Group
 * API operations sequentially.
 */
export const processApiUpdateQueue = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const sets = state.admin!.sqlSets.sets;
        dispatch(setNoClickModalState({ message: "Saving", state: NoClickModalStates.CallingServer }));

        try {
            const queue = getApiUpdateQueue(sets, dispatch, state);
            for (const process of queue) {
                await process();
            }

            // All done!
            dispatch(setAdminConceptSqlSetsUnchanged());
            dispatch(setNoClickModalState({ message: "Saved", state: NoClickModalStates.Complete }));
        } catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "An error occurred while attempting update the Leaf database with your changes. Please see the Leaf error logs for details.",
                header: "Error Applying Changes",
                show: true
            };
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    }
};

/*
 * Save or update a Concept SQL Set, depending on
 * if it is preexisting or new.
 */
export const saveOrUpdateAdminConceptSqlSet = async (set: ConceptSqlSet, dispatch: any, state: AppState): Promise<ConceptSqlSet> => {
    let newSet = null;
    if (set.unsaved) {
        newSet = await createSqlSet(state, set);
    } else {
        newSet = await updateSqlSet(state, set);
    }
    dispatch(syncAdminConceptSqlSetUnsavedWithSaved(set, newSet));
    return newSet;
};

/*
 * Fetch SQL Sets.
 */
export const getAdminConceptSqlSets = () => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            dispatch(setNoClickModalState({ message: "Loading", state: NoClickModalStates.CallingServer }));
            const state = getState();
            const sets = await getSqlSets(state);
            dispatch(setAdminConceptSqlSets(sets, false));
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Complete }));
        } catch (err) {
            const info: InformationModalState = {
                body: "An error occurred while attempting to load SQL Sets. Please see the Leaf error logs for details.",
                header: "Error Loading SQL Sets",
                show: true
            };
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    };
};

/*
 * Delete an existing SQL Set.
 */
export const deleteAdminConceptSqlSet = (set: ConceptSqlSet) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
            deleteSqlSet(state, set)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Deleted", state: NoClickModalStates.Complete }));
                        dispatch(removeAdminConceptSqlSet(set));
                },  error => {
                    const info: InformationModalState = {
                        body: "",
                        header: "Error Deleting SQL Set",
                        show: true
                    };
                    if (error.response.status === 409) {
                        const conflicts = error.response.data as ConceptSqlSetDeleteResponse;
                        info.body = 
                            `There are ${conflicts.conceptCount} Concept(s) and ${conflicts.specializationGroupCount} ` +
                            `Specialization Group(s) (dropdowns) which depend on this SQL Set. Please set these to use a different ` +
                            `SQL Set or delete them first.`;
                    } else {
                        info.body = "An error occurred while attempting to delete the SQL Set. Please see the Leaf error logs for details.";
                    }
                    dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                    dispatch(showInfoModal(info));
                });
        } catch (err) {
            console.log(err);
        }
    }
};

// Synchronous
export const setAdminConceptSqlSet = (set: ConceptSqlSet, changed: boolean): AdminSqlSetAction => {
    return {
        changed,
        sets: [ set ],
        type: SET_ADMIN_SQL_SETS
    };
};

export const setAdminConceptSqlSets = (sets: ConceptSqlSet[], changed: boolean): AdminSqlSetAction => {
    return {
        changed,
        sets,
        type: SET_ADMIN_SQL_SETS
    };
};

export const setAdminUneditedConceptSqlSets = (mappedSets: Map<number,ConceptSqlSet>): AdminSqlSetAction => {
    return {
        mappedSets,
        type: SET_ADMIN_UNEDITED_SQL_SETS
    };
};

export const removeAdminConceptSqlSet = (set: ConceptSqlSet): AdminSqlSetAction => {
    return {
        set,
        type: REMOVE_ADMIN_SQL_SET
    };
};

export const undoAdminSqlSetChanges = (): AdminSqlSetAction => {
    return {
        type: UNDO_ADMIN_SQL_SET_CHANGES
    };
};

export const setAdminConceptSqlSetsUnchanged = (): AdminSqlSetAction => {
    return {
        type: SET_ADMIN_SQL_SETS_UNCHANGED
    };
};

export const syncAdminConceptSqlSetUnsavedWithSaved = (prevSqlSet: ConceptSqlSet, set: ConceptSqlSet): AdminSqlSetAction => {
    return {
        prevSqlSet,
        set,
        type: SYNC_ADMIN_SQL_SET_UNSAVED_WITH_SAVED
    }
};