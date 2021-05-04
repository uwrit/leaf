/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { setNoClickModalState, showInfoModal, setSideNotificationState } from "../generalUi";
import { NotificationStates, InformationModalState } from "../../models/state/GeneralUiState";
import {
    createAdminVisualiationPage, 
    updateAdminVisualiationPage, 
    deleteAdminVisualizationPage
} from "../../services/admin/visualiationsApi";
import { AdminVisualizationPage } from "../../models/admin/Visualization";

export const SET_ADMIN_VISUALIZATIONS = 'SET_ADMIN_VISUALIZATIONS';
export const SET_ADMIN_VISUALIZATION = 'SET_ADMIN_VISUALIZATION';
export const UNDO_ADMIN_VISUALIZATION_CHANGE = 'UNDO_ADMIN_VISUALIZATION_CHANGE';
export const REMOVE_ADMIN_VISUALIZATION = 'REMOVE_ADMIN_VISUALIZATION';
export const SET_ADMIN_VISUALIZATION_CURRENT = 'SET_ADMIN_VISUALIZATION_CURRENT';

export interface AdminVisualizationAction {
    changed?: boolean;
    page?: AdminVisualizationPage;
    pages?: AdminVisualizationPage[];
    type: string;
}

// Asynchronous
/*
 * Save or update a Visualization Page, depending on
 * if it is preexisting or new.
 */
export const saveAdminVisualizationPage = (page: AdminVisualizationPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));
            const newPage = page.unsaved
                ? await createAdminVisualiationPage(state, page)
                : await updateAdminVisualiationPage(state, page);

            dispatch(removeAdminVisualizationPage(page));
            dispatch(setAdminVisualizationPage(newPage, false));
        } catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "An error occurred while attempting to save the Visualization. Please see the Leaf error logs for details.",
                header: "Error Saving Visualization",
                show: true
            };
            dispatch(showInfoModal(info));
        } finally {
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
        }
    };
};

/*
 * Delete a VisualizationPage.
 */
export const deleteAdminVisualization = (page: AdminVisualizationPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NotificationStates.Working }));
            deleteAdminVisualizationPage(state, page)
                .then(
                    response => {
                        dispatch(removeAdminVisualizationPage(page));
                        dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Visualization Deleted' }));
                },  error => {
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Visualization. Please see the Leaf error logs for details.",
                            header: "Error Deleting Visualization",
                            show: true
                        };
                        dispatch(showInfoModal(info));
                });
        } catch (err) {
            console.log(err);
        } finally {
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
        }
    }
};

// Synchronous
export const setAdminVisualizationPage = (page: AdminVisualizationPage, changed: boolean): AdminVisualizationAction => {
    return {
        changed,
        page,
        type: SET_ADMIN_VISUALIZATION
    };
};

export const setAdminVisualizationPages = (pages: AdminVisualizationPage[]): AdminVisualizationAction => {
    return {
        pages,
        type: SET_ADMIN_VISUALIZATIONS
    };
};

export const removeAdminVisualizationPage = (page: AdminVisualizationPage): AdminVisualizationAction => {
    return {
        page,
        type: REMOVE_ADMIN_VISUALIZATION
    };
};

export const undoAdminVisualizationPageChange = (): AdminVisualizationAction => {
    return {
        type: UNDO_ADMIN_VISUALIZATION_CHANGE
    };
};

export const setAdminCurrentVisualizationPage = (page: AdminVisualizationPage): AdminVisualizationAction => {
    return {
        page,
        type: SET_ADMIN_VISUALIZATION_CURRENT
    };
};