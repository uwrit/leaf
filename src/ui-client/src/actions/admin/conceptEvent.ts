/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { ConceptEvent } from "../../models/admin/Concept";
import { setNoClickModalState, showInfoModal } from "../generalUi";
import { NoClickModalStates, InformationModalState } from "../../models/state/GeneralUiState";
import { createConceptEvent, deleteConceptEvent, updateConceptEvent } from "../../services/admin/conceptEventApi";

export const SET_ADMIN_CONCEPT_EVENTS = 'SET_ADMIN_CONCEPT_EVENTS';
export const SET_ADMIN_UNEDITED_CONCEPT_EVENT = 'SET_ADMIN_UNEDITED_CONCEPT_EVENT';
export const UNDO_ADMIN_CONCEPT_EVENT_CHANGE = 'UNDO_ADMIN_CONCEPT_EVENT_CHANGE';
export const REMOVE_ADMIN_CONCEPT_EVENT = 'REMOVE_ADMIN_CONCEPT_EVENT';

export interface AdminConceptEventAction {
    changed?: boolean;
    ev?: ConceptEvent;
    evs?: ConceptEvent[];
    type: string;
}

// Asynchronous
/*
 * Save or update a Concept Event, depending on
 * if it is preexisting or new.
 */
export const saveAdminConceptEvent = (ev: ConceptEvent) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NoClickModalStates.CallingServer }));
            const newEv = ev.unsaved
                ? await createConceptEvent(state, ev)
                : await updateConceptEvent(state, ev);

            dispatch(removeAdminConceptEvent(ev));
            dispatch(setAdminConceptEvent(newEv, false));
            dispatch(setNoClickModalState({ message: "Saved", state: NoClickModalStates.Complete }));
        } catch (err) {
            console.log(err);
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            const info: InformationModalState = {
                body: "An error occurred while attempting to save the Concept Event. Please see the Leaf error logs for details.",
                header: "Error Saving Concept Event",
                show: true
            };
            dispatch(showInfoModal(info));
        }
    }
};

/*
 * Delete a existing Concept Event.
 */
export const deleteAdminConceptEvent = (ev: ConceptEvent) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
            deleteConceptEvent(state, ev)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Deleted", state: NoClickModalStates.Complete }));
                        dispatch(removeAdminConceptEvent(ev));
                },  error => {
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Concept Event. Please see the Leaf error logs for details.",
                            header: "Error Deleting Concept Event",
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
export const setAdminConceptEvent = (ev: ConceptEvent, changed: boolean): AdminConceptEventAction => {
    return {
        evs: [ ev ],
        changed,
        type: SET_ADMIN_CONCEPT_EVENTS
    };
};

export const setAdminConceptEvents = (evs: ConceptEvent[]): AdminConceptEventAction => {
    return {
        evs,
        type: SET_ADMIN_CONCEPT_EVENTS
    };
};

export const setAdminUneditedConceptEvent = (ev: ConceptEvent): AdminConceptEventAction => {
    return {
        ev,
        type: SET_ADMIN_UNEDITED_CONCEPT_EVENT
    };
};

export const removeAdminConceptEvent = (ev: ConceptEvent): AdminConceptEventAction => {
    return {
        ev,
        type: REMOVE_ADMIN_CONCEPT_EVENT
    };
};

export const undoAdminConceptEventChange = (): AdminConceptEventAction => {
    return {
        type: UNDO_ADMIN_CONCEPT_EVENT_CHANGE
    };
};