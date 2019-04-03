/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { SpecializationGroup, SpecializationGroupDeleteResponse } from "../../models/admin/Concept";
import { getSpecializationGroups, updateSpecializationGroup, deleteSpecializationGroup, createSpecializationGroup } from "../../services/admin/specializationGroupApi";
import { setNoClickModalState, showInfoModal } from "../generalUi";
import { NoClickModalStates, InformationModalState } from "../../models/state/GeneralUiState";

export const SET_ADMIN_SPECIALIZATION_GROUPS = 'SET_ADMIN_SPECIALIZATION_GROUPS';
export const REMOVE_ADMIN_SPECIALIZATION_GROUP = 'REMOVE_ADMIN_SPECIALIZATION_GROUP';
export const SYNC_ADMIN_SPECIALIZATION_GROUP_UNSAVED_WITH_SAVED = 'SYNC_ADMIN_SPECIALIZATION_GROUP_UNSAVED_WITH_SAVED';

export interface AdminSpecializationGroupAction {
    group?: SpecializationGroup;
    groups?: SpecializationGroup[];
    prevGroup?: SpecializationGroup;
    type: string;
}

// Asynchronous
/*
 * Save or update a Specialization Group, depending on
 * if it is preexisting or new.
 */
export const saveOrUpdateAdminConceptSpecializationGroup = async (grp: SpecializationGroup, dispatch: any, state: AppState): Promise<SpecializationGroup> => {
    let newGrp = null;
    if (grp.unsaved) {
        newGrp = await createSpecializationGroup(state, grp);
    } else {
        newGrp = await updateSpecializationGroup(state, grp);
    }
    dispatch(syncAdminSpecializationGroupUnsavedWithSaved(grp, newGrp));
    return newGrp;
};

/*
 * Fetch Specialization Groups.
 */
export const getAdminConceptSpecializationGroups = () => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            dispatch(setNoClickModalState({ message: "Loading", state: NoClickModalStates.CallingServer }));
            const state = getState();
            const sets = await getSpecializationGroups(state);
            dispatch(setAdminConceptSpecializationGroups(sets));
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Complete }));
        } catch (err) {
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            const info: InformationModalState = {
                body: "An error occurred while attempting to load Concept Specialization Groups. Please see the Leaf error logs for details.",
                header: "Error Loading Concept Specialization Groups",
                show: true
            };
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    };
};

/*
 * Delete a existing Concept Specialization Group.
 */
export const deleteAdminConceptSpecializationGroup = (group: SpecializationGroup) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
            deleteSpecializationGroup(state, group)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Deleted", state: NoClickModalStates.Complete }));
                        dispatch(removeAdminConceptSpecializationGroup(group));
                },  error => {
                        const info: InformationModalState = {
                            body: "",
                            header: "Error Deleting Specialization Group",
                            show: true
                        };
                        if (error.response.status === 409) {
                            const conflicts = error.response.data as SpecializationGroupDeleteResponse;
                            const ex = conflicts.concepts[0];
                            info.body = 
                                `There are ${conflicts.conceptCount} Concept(s) which depend on this Specialization Group, ` +
                                `including "${ex.uiDisplayName}" (Id "${ex.id}"). Please delete these first.`;
                        } else {
                            info.body = 
                                "An error occurred while attempting to delete the Concept Specialization Group. " +
                                "Please see the Leaf error logs for details.";
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
export const setAdminConceptSpecializationGroup = (group: SpecializationGroup): AdminSpecializationGroupAction => {
    return {
        groups: [ group ],
        type: SET_ADMIN_SPECIALIZATION_GROUPS
    };
};

export const setAdminConceptSpecializationGroups = (groups: SpecializationGroup[]): AdminSpecializationGroupAction => {
    return {
        groups,
        type: SET_ADMIN_SPECIALIZATION_GROUPS
    };
};

export const removeAdminConceptSpecializationGroup = (group: SpecializationGroup): AdminSpecializationGroupAction => {
    return {
        group,
        type: REMOVE_ADMIN_SPECIALIZATION_GROUP
    };
};

export const syncAdminSpecializationGroupUnsavedWithSaved = (prevGroup: SpecializationGroup, group: SpecializationGroup): AdminSpecializationGroupAction => {
    return {
        prevGroup,
        group,
        type: SYNC_ADMIN_SPECIALIZATION_GROUP_UNSAVED_WITH_SAVED
    };
};