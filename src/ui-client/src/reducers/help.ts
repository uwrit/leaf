/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import {
    SET_HELP_PAGES_AND_CATEGORIES,
    SET_HELP_PAGE_CATEGORIES,
    SET_HELP_PAGES,
    SET_HELP_PAGE_LOAD_STATE,
    SET_HELP_PAGE_CONTENT,
} from '../actions/helpPage';
import { HelpPageAction, HelpPageContentAction } from '../actions/helpPage';
import { HelpPageLoadState, HelpPageState } from '../models/state/HelpState';
import { categoryId, HelpPageCategoryDTO, HelpPageCategory, HelpPageDTO, HelpPageMap, HelpCategoryMap } from '../models/Help/Help';

export const defaultHelpPagesState = (): HelpPageState => {
    return {
        categories: [],
        content: {
            content: [],
            state: HelpPageLoadState.NOT_LOADED
        },
        pages: new Map<categoryId, HelpPageDTO[]>(),
        state: HelpPageLoadState.NOT_LOADED,

        categoriesA: new Map<categoryId, HelpPageCategory>(),
        currentPage: undefined
    };
};

const mapPages = (pages: HelpPageDTO[]): HelpPageMap => {
    const mappedPages = new Map<categoryId, HelpPageDTO[]>();

    for (let p of pages) {
        if (mappedPages.has(p.categoryId)) {
            mappedPages.set(p.categoryId, [...mappedPages.get(p.categoryId)!, p]);
        } else {
            mappedPages.set(p.categoryId, [...[], p]);
        }
    };

    return mappedPages;
};

const SetHelpPageCategories = (state: HelpPageState, action: HelpPageAction): HelpPageState => {    
    return Object.assign({}, state, {
        categories: action.categories
    });
};

const SetHelpPages = (state: HelpPageState, action: HelpPageAction): HelpPageState => {
    const mappedPages = mapPages(action.pages!);
    return Object.assign({}, state, {
        pages: mappedPages
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
            content: (action.state === HelpPageLoadState.LOADED) ? action.content : undefined,
            state: action.state
        }
    });
};


const mapCategories = (categories: HelpPageCategoryDTO[], pages: HelpPageDTO[]): HelpCategoryMap => {
    const mappedCategories = new Map<categoryId, HelpPageCategory>();

    for (let c of categories) {
        const categoryPages = pages.filter(p => p.categoryId === c.id);
        const updatedCategory = Object.assign({ ...c, categoryPages }) as HelpPageCategory;

        if (mappedCategories.has(c.id)) {
            mappedCategories.set(c.id, updatedCategory);
        } else {
            mappedCategories.set(c.id, updatedCategory);
        }
    };

    return mappedCategories;
};

const SetHelpPagesAndCategories = (state: HelpPageState, action: HelpPageAction): HelpPageState => {
    const mappedCategories = mapCategories(action.categories!, action.pages!);
    return Object.assign({}, state, {
        categoriesA: mappedCategories
    });
};

type HelpAction = HelpPageAction | HelpPageContentAction;

export const help = (state: HelpPageState = defaultHelpPagesState(), action: HelpAction): HelpPageState => {
    switch (action.type) {
        case SET_HELP_PAGES_AND_CATEGORIES:
            return SetHelpPagesAndCategories(state, action);
        case SET_HELP_PAGE_CATEGORIES:
            return SetHelpPageCategories(state, action);
        case SET_HELP_PAGES:
            return SetHelpPages(state, action);
        case SET_HELP_PAGE_LOAD_STATE:
            return setHelpPageLoadState(state, action);
        case SET_HELP_PAGE_CONTENT:
            return setHelpPageContent(state, action);
        default:
            return state;
    }
};