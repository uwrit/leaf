/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import AdminState, { AdminHelpPageLoadState } from '../../models/state/AdminState';
import { categoryId, AdminHelpCategoryMap, AdminHelpPageDTO, AdminHelpPageCategoryDTO, AdminHelpPageCategoryExt} from '../../models/admin/Help';
import { AdminHelpPageAction, AdminHelpPageContentAction } from '../../actions/admin/helpPage';

const mapCategories = (categories: AdminHelpPageCategoryDTO[], pages: AdminHelpPageDTO[]): AdminHelpCategoryMap => {
    const mappedCategories = new Map<categoryId, AdminHelpPageCategoryExt>();

    for (let c of categories) {
        const categoryPages = pages.filter(p => p.categoryId === c.id);
        
        // TODO: pages should be AdminHelpPage, NOT AdminHelpPageDTO
        const updatedCategory = Object.assign({ ...c, categoryPages }) as AdminHelpPageCategoryExt;
    
        // If pages for the category exist, then proceed; else, no need to for category without pages.
        if (categoryPages.length) {
            if (mappedCategories.has(c.id)) {
                mappedCategories.set(c.id, updatedCategory);
            } else {
                mappedCategories.set(c.id, updatedCategory);
            }
        };
    };

    return mappedCategories;
};

export const setAdminHelpPagesAndCategories = (state: AdminState, action: AdminHelpPageAction): AdminState => {
    const mappedCategories = mapCategories(action.categories!, action.pages!);

    return Object.assign({}, state, {
        help: {
            ...state.help,
            categories: mappedCategories
        }
    });
};

export const setAdminHelpPageAndContent = (state: AdminState, action: AdminHelpPageContentAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            content: {
                ...state.help.content,
                page: (action.contentState === AdminHelpPageLoadState.LOADED) ? action.page : undefined,
                contentState: action.contentState
            }
        }
    });
};

export const setCurrentAdminHelpPageAndContent = (state: AdminState, action: AdminHelpPageAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            currentContent: action.currentContent
        }
    });
};

export const setCurrentSelectedAdminHelpPage = (state: AdminState, action: AdminHelpPageAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            currentSelectedPage: action.currentSelectedPage
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