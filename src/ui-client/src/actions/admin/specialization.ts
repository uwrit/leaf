/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { Specialization } from "../../models/admin/Concept";
import { createSpecialization, updateSpecialization, deleteSpecialization } from "../../services/admin/specializationApi";
import { setNoClickModalState, showInfoModal, setSideNotificationState } from "../generalUi";
import { NotificationStates, InformationModalState } from "../../models/state/GeneralUiState";

export const SET_ADMIN_SPECIALIZATIONS = 'SET_ADMIN_SPECIALIZATIONS';
export const REMOVE_ADMIN_SPECIALIZATION = 'REMOVE_ADMIN_SPECIALIZATION';
export const SYNC_ADMIN_SPECIALIZATION_UNSAVED_WITH_SAVED = 'SYNC_ADMIN_SPECIALIZATION_UNSAVED_WITH_SAVED';

export interface AdminSpecializationAction {
    changed?: boolean;
    prevSpc?: Specialization;
    spc?: Specialization;
    spcs?: Specialization[];
    type: string;
}

// Asynchronous
/*
 * Save or update a Concept Specialization, depending on
 * if it is preexisting or new.
 */
export const saveOrUpdateAdminSpecialization = async (spc: Specialization, dispatch: any, state: AppState): Promise<Specialization> => {
    let newSpc = null;
    if (spc.unsaved) {
        newSpc = await createSpecialization(state, spc);
        dispatch(removeAdminConceptSpecialization(spc));
    } else {
        newSpc = await updateSpecialization(state, spc);
    }
    dispatch(setAdminConceptSpecialization(newSpc, false));
    return newSpc;
};

/*
 * Delete a existing Concept Specialization.
 */
export const deleteAdminConceptSpecialization = (spc: Specialization) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NotificationStates.Working }));
            deleteSpecialization(state, spc)
                .then(
                    response => {
                        dispatch(removeAdminConceptSpecialization(spc));
                        dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Specialization Deleted' }));
                },  error => {
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Concept Specialization. Please see the Leaf error logs for details.",
                            header: "Error Deleting Concept Specialization",
                            show: true
                        };
                        dispatch(showInfoModal(info));
                }).then(() => dispatch(setNoClickModalState({ state: NotificationStates.Hidden })));
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

export const syncAdminSpecializationUnsavedWithSaved = (prevSpc: Specialization, spc: Specialization): AdminSpecializationAction => {
    return {
        prevSpc,
        spc,
        type: SYNC_ADMIN_SPECIALIZATION_UNSAVED_WITH_SAVED
    };
};