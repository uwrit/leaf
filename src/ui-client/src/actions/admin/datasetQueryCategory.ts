/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { setNoClickModalState, showInfoModal, setSideNotificationState } from "../generalUi";
import { NotificationStates, InformationModalState } from "../../models/state/GeneralUiState";
import { DatasetQueryCategory } from "../../models/admin/Dataset";
import { createDatasetQueryCategory, updateDatasetQueryCategory, deleteDatasetQueryCategory } from "../../services/admin/datasetQueryCategoryApi";

export const SET_ADMIN_DATASET_QUERY_CATEGORIES = 'SET_ADMIN_DATASET_QUERY_CATEGORIES';
export const SET_ADMIN_UNEDITED_DATASET_QUERY_CATEGORY = 'SET_ADMIN_UNEDITED_DATASET_QUERY_CATEGORY';
export const UNDO_ADMIN_DATASET_QUERY_CATEGORY_CHANGE = 'UNDO_ADMIN_DATASET_QUERY_CATEGORY_CHANGE';
export const REMOVE_ADMIN_DATASET_QUERY_CATEGORY = 'REMOVE_ADMIN_DATASET_QUERY_CATEGORY';

export interface AdminDatasetQueryCategoryAction {
    changed?: boolean;
    cat?: DatasetQueryCategory;
    cats?: DatasetQueryCategory[];
    type: string;
}

// Asynchronous
/*
 * Save or update a Dataset Query Category, depending on
 * if it is preexisting or new.
 */
export const saveAdminDatasetQueryCategory = (cat: DatasetQueryCategory) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));
            const newCat = cat.unsaved
                ? await createDatasetQueryCategory(state, cat)
                : await updateDatasetQueryCategory(state, cat);

            dispatch(removeAdminDatasetQueryCategory(cat));
            dispatch(setAdminDatasetQueryCategory(newCat, false));
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
export const deleteAdminDatasetQueryCategory = (cat: DatasetQueryCategory) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NotificationStates.Working }));
            deleteDatasetQueryCategory(state, cat)
                .then(
                    response => {
                        dispatch(removeAdminDatasetQueryCategory(cat));
                        dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Dataset Category Deleted' }));
                },  error => {
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Dataset Query Category. Please see the Leaf error logs for details.",
                            header: "Error Deleting Dataset Query Category",
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
export const setAdminDatasetQueryCategory = (cat: DatasetQueryCategory, changed: boolean): AdminDatasetQueryCategoryAction => {
    return {
        cats: [ cat ],
        changed,
        type: SET_ADMIN_DATASET_QUERY_CATEGORIES
    };
};

export const setAdminDatasetQueryCategories = (cats: DatasetQueryCategory[]): AdminDatasetQueryCategoryAction => {
    return {
        cats,
        type: SET_ADMIN_DATASET_QUERY_CATEGORIES
    };
};

export const setAdminUneditedDatasetQueryCategory = (cat: DatasetQueryCategory): AdminDatasetQueryCategoryAction => {
    return {
        cat,
        type: SET_ADMIN_UNEDITED_DATASET_QUERY_CATEGORY
    };
};

export const removeAdminDatasetQueryCategory = (cat: DatasetQueryCategory): AdminDatasetQueryCategoryAction => {
    return {
        cat,
        type: REMOVE_ADMIN_DATASET_QUERY_CATEGORY
    };
};

export const undoAdminDatasetQueryCategoryChange = (): AdminDatasetQueryCategoryAction => {
    return {
        type: UNDO_ADMIN_DATASET_QUERY_CATEGORY_CHANGE
    };
};