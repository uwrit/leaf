/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Dcateloped by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminDatasetQueryCategoryAction } from "../../actions/admin/datasetQueryCategory";

export const setAdminDatasetQueryCategories = (state: AdminState, action: AdminDatasetQueryCategoryAction): AdminState => {
    for (const cat of action.cats!) {
        state.datasetQueryCategories.categories.set(cat.id, Object.assign({}, cat));
    }
    return Object.assign({}, state, { 
        datasetQueryCategories: {
            ...state.datasetQueryCategories,
            changed: action.changed,
            categories: new Map(state.datasetQueryCategories.categories)
        }
    });
};

export const setAdminUneditedDatasetQueryCategory = (state: AdminState, action: AdminDatasetQueryCategoryAction): AdminState => {
    return Object.assign({}, state, { 
        datasetQueryCategories: {
            ...state.datasetQueryCategories,
            uneditedCategory: Object.assign({}, action.cat, { changed: false })
        }
    });
};

export const removeAdminDatasetQueryCategory = (state: AdminState, action: AdminDatasetQueryCategoryAction): AdminState => {
    state.datasetQueryCategories.categories.delete(action.cat!.id);
    return Object.assign({}, state, { 
        datasetQueryCategories: { 
            categories: new Map(state.datasetQueryCategories.categories)
        }
    });
};

export const undoAdminDatasetQueryCategoryChange = (state: AdminState, action: AdminDatasetQueryCategoryAction): AdminState => {
    const unedited = state.datasetQueryCategories.uneditedCategory!;

    if (unedited.id) {
        state.datasetQueryCategories.categories.set(unedited.id, Object.assign({}, unedited));
    }

    return Object.assign({}, state, { 
        datasetQueryCategories: { 
            changed: false,
            categories: new Map(state.datasetQueryCategories.categories),
            uneditedCategory: undefined
        }
    });
};