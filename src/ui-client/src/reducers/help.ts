/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import {
    SET_HELP_PAGES_AND_CATEGORIES,
    SET_CURRENT_HELP_PAGE,
    SET_HELP_PAGE_LOAD_STATE,
    SET_HELP_PAGE_CONTENT,
    HelpPageAction,
    HelpPageContentAction,
} from '../actions/helpPage';
import { categoryId, HelpCategoryMap, HelpPage, HelpPageCategory, HelpPageCategoryDTO, HelpPageDTO } from '../models/help/Help';
import { HelpPageLoadState, HelpPageState } from '../models/state/HelpState';

export const defaultHelpPagesState = (): HelpPageState => {
    return {
        categories: new Map<categoryId, HelpPageCategory>(),
        currentSelectedPage: Object.assign({}) as HelpPage,
        content: {
            rows: [],
            state: HelpPageLoadState.NOT_LOADED
        },
        state: HelpPageLoadState.NOT_LOADED,
    };
};

const mapCategories = (categories: HelpPageCategoryDTO[], pages: HelpPageDTO[]): HelpCategoryMap => {
    const mappedCategories = new Map<categoryId, HelpPageCategory>();

    for (let c of categories) {
        const categoryPages = pages.filter(p => p.categoryId === c.id);
        const updatedCategory = Object.assign({ ...c, categoryPages }) as HelpPageCategory;

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

const setHelpPagesAndCategories = (state: HelpPageState, action: HelpPageAction): HelpPageState => {
    const mappedCategories = mapCategories(action.categories!, action.pages!);
    
    return Object.assign({}, state, {
        categories: mappedCategories
    });
};

const setCurrentHelpPage = (state: HelpPageState, action: HelpPageAction): HelpPageState => {
    return Object.assign({}, state, {
        currentSelectedPage: action.currentSelectedPage,
    });
};

const setHelpPageLoadState = (state: HelpPageState, action: HelpPageAction): HelpPageState => {
    return Object.assign({}, state, {
        state: action.state
    });
};

const setHelpPageContent = (state: HelpPageState, action: HelpPageContentAction): HelpPageState => {
    return Object.assign({}, state, {
        content: {
            ...state.content,
            rows: (action.state === HelpPageLoadState.LOADED) ? action.rows : undefined,
            state: action.state,
        }
    });
};

type HelpAction = HelpPageAction | HelpPageContentAction;

export const help = (state: HelpPageState = defaultHelpPagesState(), action: HelpAction): HelpPageState => {
    switch (action.type) {
        case SET_HELP_PAGES_AND_CATEGORIES:
            return setHelpPagesAndCategories(state, action);
        case SET_CURRENT_HELP_PAGE:
            return setCurrentHelpPage(state, action);
        case SET_HELP_PAGE_LOAD_STATE:
            return setHelpPageLoadState(state, action);
        case SET_HELP_PAGE_CONTENT:
            return setHelpPageContent(state, action);
        default:
            return state;
    }
};