/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AdminHelpPageAction } from '../../actions/admin/helpPage';
import { AdminHelpCategoryMap, AdminHelpCategoryPageCache, AdminHelpPageCategory,
        categoryId, PartialAdminHelpPage } from '../../models/admin/Help';
import AdminState from '../../models/state/AdminState';

const mapCategories = (categories: AdminHelpPageCategory[], partialPages: PartialAdminHelpPage[]): AdminHelpCategoryMap => {
    const mappedCategories = new Map<categoryId, AdminHelpCategoryPageCache>();
    for (let c of categories) {
        const catPartialPages = partialPages.filter(p => p.categoryId === c.id);
        const updatedCatPageCache = Object.assign({ ...c, partialPages: catPartialPages }) as AdminHelpCategoryPageCache;  
        mappedCategories.set(c.id, updatedCatPageCache);
    };
    return mappedCategories;
};

export const setAdminHelpCategoryMap = (state: AdminState, action: AdminHelpPageAction): AdminState => {
    const mappedCategories = mapCategories(action.categories!, action.partialPages!);
    return Object.assign({}, state, {
        help: {
            ...state.help,
            categories: mappedCategories
        }
    });
};

export const updateAdminHelpCategoryMap = (state: AdminState, action: AdminHelpPageAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            categories: action.categoryMap
        }
    });
};

export const setAdminHelpPage = (state: AdminState, action: AdminHelpPageAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            page: action.page
        }
    });
};

export const setCurrentAdminHelpPage = (state: AdminState, action: AdminHelpPageAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            currentPage: action.currentPage
        }
    });
};

export const setAdminHelpPageLoadState = (state: AdminState, action: AdminHelpPageAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            helpState: action.helpState
        }
    });
};

export const isAdminHelpPageNew = (state: AdminState, action: AdminHelpPageAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            isNew: action.isNew
        }
    });
};

export const isAdminHelpPageUnsaved = (state: AdminState, action: AdminHelpPageAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            unsaved: action.unsaved
        }
    });
};