/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { setNoClickModalState, showInfoModal, setSideNotificationState } from "../generalUi";
import { NotificationStates, InformationModalState } from "../../models/state/GeneralUiState";
import { createVisualizationCategory, updateVisualizationCategory, deleteVisualizationCategory } from "../../services/admin/visualizationCategoryApi";
import { AdminVisualizationCategory } from "../../models/admin/Visualization";

export const SET_ADMIN_VISUALIZATION_CATEGORIES = 'SET_ADMIN_VISUALIZATION_CATEGORIES';
export const SET_ADMIN_UNEDITED_VISUALIZATION_CATEGORY = 'SET_ADMIN_UNEDITED_VISUALIZATION_CATEGORY';
export const UNDO_ADMIN_VISUALIZATION_CATEGORY_CHANGE = 'UNDO_ADMIN_VISUALIZATION_CATEGORY_CHANGE';
export const REMOVE_ADMIN_VISUALIZATION_CATEGORY = 'REMOVE_ADMIN_VISUALIZATION_CATEGORY';

export interface AdminVisualizationCategoryAction {
    changed?: boolean;
    category?: AdminVisualizationCategory;
    categories?: AdminVisualizationCategory[];
    type: string;
}

// Asynchronous
/*
 * Save or update a Dataset Query Category, depending on
 * if it is preexisting or new.
 */
export const saveAdminVisualizationCategory = (cat: AdminVisualizationCategory) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));
            const newCat = cat.unsaved
                ? await createVisualizationCategory(state, cat)
                : await updateVisualizationCategory(state, cat);

            dispatch(removeAdminVisualizationCategory(cat));
            dispatch(setAdminVisualizationCategory(newCat, false));
            dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Dataset Category Saved' }));
        } catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "An error occurred while attempting to save the Dataset Query Category. Please see the Leaf error logs for details.",
                header: "Error Saving Dataset Query Category",
                show: true
            };
            dispatch(showInfoModal(info));
        } finally {
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
        }
    }
};

/*
 * Delete a existing Dataset Query Category.
 */
export const deleteAdminVisualizationCategory = (cat: AdminVisualizationCategory) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NotificationStates.Working }));
            deleteVisualizationCategory(state, cat)
                .then(
                    response => {
                        dispatch(removeAdminVisualizationCategory(cat));
                        dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Visualization Category Deleted' }));
                },  error => {
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Visualization Category. Please see the Leaf error logs for details.",
                            header: "Error Deleting Visualization Query Category",
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
export const setAdminVisualizationCategory = (category: AdminVisualizationCategory, changed: boolean): AdminVisualizationCategoryAction => {
    return {
        categories: [ category ],
        changed,
        type: SET_ADMIN_VISUALIZATION_CATEGORIES
    };
};

export const setAdminVisualizationCategories = (categories: AdminVisualizationCategory[]): AdminVisualizationCategoryAction => {
    return {
        categories,
        type: SET_ADMIN_VISUALIZATION_CATEGORIES
    };
};

export const setAdminUneditedVisualizationCategory = (category: AdminVisualizationCategory): AdminVisualizationCategoryAction => {
    return {
        category,
        type: SET_ADMIN_UNEDITED_VISUALIZATION_CATEGORY
    };
};

export const removeAdminVisualizationCategory = (category: AdminVisualizationCategory): AdminVisualizationCategoryAction => {
    return {
        category,
        type: REMOVE_ADMIN_VISUALIZATION_CATEGORY
    };
};

export const undoAdminVisualizationCategoryChange = (): AdminVisualizationCategoryAction => {
    return {
        type: UNDO_ADMIN_VISUALIZATION_CATEGORY_CHANGE
    };
};