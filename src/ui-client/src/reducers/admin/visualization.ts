/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminVisualizationAction } from "../../actions/admin/visualization";


export const setAdminVisualizationPages = (state: AdminState, action: AdminVisualizationAction): AdminState => {
    const pages = new Map(state.visualizations.pages);
    for (const page of action.pages) {
        pages.set(page.id, Object.assign({}, page));
    }
    return Object.assign({}, state, { 
        visualizations: {
            ...state.visualizations,
            pages
        }
    });
};

export const setAdminVisualizationPage = (state: AdminState, action: AdminVisualizationAction): AdminState => {
    let uneditedPage = state.visualizations.uneditedPage;
    if (action.changed && !state.visualizations.changed) {
        uneditedPage = state.visualizations.pages.get(action.page!.id);
    }
    state.visualizations.pages.set(action.page!.id, Object.assign({}, action.page));

    return Object.assign({}, state, { 
        visualizations: {
            ...state.visualizations,
            uneditedPage,
            changed: action.changed
        }
    });
};

export const removeAdminVisualizationPage = (state: AdminState, action: AdminVisualizationAction): AdminState => {
    state.visualizations.pages.delete(action.page!.id);
    return Object.assign({}, state, { 
        visualizations: { 
            ...state.visualizations,
        }
    });
};

export const setCurrentAdminVisualizationPage = (state: AdminState, action: AdminVisualizationAction): AdminState => {
    return Object.assign({}, state, { 
        visualizations: { 
            ...state.visualizations,
            currentPage: action.page
        }
    });
};

export const undoAdminVisualizationPageChange = (state: AdminState, action: AdminVisualizationAction): AdminState => {
    const uneditedPage = state.visualizations.uneditedPage;

    if (uneditedPage && uneditedPage.id) {
        state.visualizations.pages.set(uneditedPage.id, Object.assign({}, uneditedPage));
    }

    return Object.assign({}, state, { 
        visualizations: {
            ...state.visualizations,
            uneditedPage: undefined,
            changed: false
        }
    });
};