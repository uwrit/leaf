/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Dcateloped by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminVisualizationCategoryAction } from "../../actions/admin/visualizationCategory";

export const setAdminVisualizationCategories = (state: AdminState, action: AdminVisualizationCategoryAction): AdminState => {
    for (const cat of action.cats!) {
        state.visualizationCategories.categories.set(cat.id, Object.assign({}, cat));
    }
    return Object.assign({}, state, { 
        visualizationCategories: {
            ...state.visualizationCategories,
            changed: action.changed,
            categories: new Map(state.visualizationCategories.categories)
        }
    });
};

export const setAdminUneditedVisualizationCategory = (state: AdminState, action: AdminVisualizationCategoryAction): AdminState => {
    return Object.assign({}, state, { 
        visualizationCategories: {
            ...state.visualizationCategories,
            uneditedCategory: Object.assign({}, action.cat, { changed: false })
        }
    });
};

export const removeAdminVisualizationCategory = (state: AdminState, action: AdminVisualizationCategoryAction): AdminState => {
    state.visualizationCategories.categories.delete(action.cat!.id);
    return Object.assign({}, state, { 
        visualizationCategories: { 
            categories: new Map(state.visualizationCategories.categories)
        }
    });
};

export const undoAdminVisualizationCategoryChange = (state: AdminState, action: AdminVisualizationCategoryAction): AdminState => {
    const unedited = state.visualizationCategories.uneditedCategory!;

    if (unedited.id) {
        state.visualizationCategories.categories.set(unedited.id, Object.assign({}, unedited));
    }

    return Object.assign({}, state, { 
        visualizationCategories: { 
            changed: false,
            categories: new Map(state.visualizationCategories.categories),
            uneditedCategory: undefined
        }
    });
};