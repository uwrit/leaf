/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { Specialization } from "../../models/admin/Concept";
import { createSpecialization, updateSpecialization, deleteSpecialization } from "../../services/admin/specializationApi";
import { setNoClickModalState, showInfoModal } from "../generalUi";
import { NoClickModalStates, InformationModalState } from "../../models/state/GeneralUiState";

export const SET_ADMIN_SPECIALIZATIONS = 'SET_ADMIN_SPECIALIZATIONS';
export const SET_ADMIN_CURRENT_SPECIALIZATION = 'SET_ADMIN_CURRENT_SPECIALIZATION';
export const SET_ADMIN_UNEDITED_SPECIALIZATION = 'SET_ADMIN_UNEDITED_SPECIALIZATION';
export const REMOVE_ADMIN_SPECIALIZATION = 'REMOVE_ADMIN_SPECIALIZATION';

export interface AdminSpecializationAction {
    changed?: boolean;
    spc?: Specialization;
    spcs?: Specialization[];
    type: string;
}

// Asynchronous
/*
 * Save a new Concept Specialization Groups.
 */
export const saveOrUpdateAdminSpecialization = (spc: Specialization) => {
    return async (dispatch: any, getState: () => AppState) => {
        if (spc.unsaved) {
            dispatch(saveNewAdminSpecialization(spc));
        } else {
            dispatch(updateAdminSpecialization(spc));
        }
    }
};

export const saveNewAdminSpecialization = (spc: Specialization) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Saving", state: NoClickModalStates.CallingServer }));
            createSpecialization(state, spc)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Saved", state: NoClickModalStates.Complete }));
                        dispatch(setAdminConceptSpecialization(response, false));
                        console.log(response);
                },  error => {
                        dispatch(setAdminConceptSpecialization(spc, false));
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to save the Concept Specialization. Please see the Leaf error logs for details.",
                            header: "Error Saving Concept Specialization",
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
 * Save a new Concept Specialization.
 */
export const updateAdminSpecialization = (spc: Specialization) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Updating", state: NoClickModalStates.CallingServer }));
            updateSpecialization(state, spc)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Updated", state: NoClickModalStates.Complete }));
                        dispatch(removeAdminConceptSpecialization(spc));
                        dispatch(setAdminConceptSpecialization(response, false));
                        console.log(response);
                },  error => {
                        dispatch(setAdminConceptSpecialization(spc, false));
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to update the Concept Specialization. Please see the Leaf error logs for details.",
                            header: "Error Updating Concept Specialization",
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
 * Delete a existing Concept Specialization.
 */
export const deleteAdminConceptSpecialization = (spc: Specialization) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
            deleteSpecialization(state, spc)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Deleted", state: NoClickModalStates.Complete }));
                        dispatch(removeAdminConceptSpecialization(spc));
                },  error => {
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Concept Specialization. Please see the Leaf error logs for details.",
                            header: "Error Deleting Concept Specialization",
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
export const setAdminConceptSpecialization = (spc: Specialization, changed: boolean): AdminSpecializationAction => {
    return {
        spcs: [ spc ],
        changed,
        type: SET_ADMIN_SPECIALIZATIONS
    };
};

export const setAdminCurrentConceptSpecialization = (spc: Specialization): AdminSpecializationAction => {
    return {
        spc,
        type: SET_ADMIN_CURRENT_SPECIALIZATION
    };
};

export const setAdminUneditedConceptSpecialization = (spc: Specialization): AdminSpecializationAction => {
    return {
        spc,
        type: SET_ADMIN_UNEDITED_SPECIALIZATION
    };
};

export const setAdminConceptSpecializations = (spcs: Specialization[]): AdminSpecializationAction => {
    return {
        spcs,
        type: SET_ADMIN_SPECIALIZATIONS
    };
};

export const removeAdminConceptSpecialization = (spc: Specialization): AdminSpecializationAction => {
    return {
        spc,
        type: REMOVE_ADMIN_SPECIALIZATION
    };
};