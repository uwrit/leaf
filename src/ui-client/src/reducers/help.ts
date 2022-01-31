/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import {
    SET_HELP_PAGE,
    SET_HELP_PAGES_AND_CATEGORIES,
    SET_HELP_PAGE_LOAD_STATE,
    HelpPageAction
} from '../actions/helpPage';
import { categoryId, HelpCategoryMap, HelpCategoryPageCache, HelpPage, HelpPageCategory, PartialHelpPage } from '../models/help/Help';
import { HelpPageLoadState, HelpPageState } from '../models/state/HelpState';

export const defaultHelpPageState = (): HelpPageState => {
    return {
        categories: new Map<categoryId, HelpCategoryPageCache>(),
        page: Object.assign({}) as HelpPage,
        state: HelpPageLoadState.NOT_LOADED,
    };
};

const mapCategories = (categories: HelpPageCategory[], partialPages: PartialHelpPage[]): HelpCategoryMap => {
    const mappedCategories = new Map<categoryId, HelpCategoryPageCache>();

    for (let c of categories) {
        const catPartialPages = partialPages.filter(p => p.categoryId === c.id);
        const updatedCatPageCache = Object.assign({ ...c, partialPages: catPartialPages }) as HelpCategoryPageCache;
        
        mappedCategories.set(c.id, updatedCatPageCache);    
    };

    return mappedCategories;
};

const setHelpPagesAndCategories = (state: HelpPageState, action: HelpPageAction): HelpPageState => {
    const mappedCategories = mapCategories(action.categories!, action.partialPages!);
    
    return Object.assign({}, state, {
        categories: mappedCategories
    });
};

const setHelpPage = (state: HelpPageState, action: HelpPageAction): HelpPageState => {
    return Object.assign({}, state, {
        page: action.page
    });
};

const setHelpPageLoadState = (state: HelpPageState, action: HelpPageAction): HelpPageState => {
    return Object.assign({}, state, {
        state: action.state
    });
};

export const help = (state: HelpPageState = defaultHelpPageState(), action: HelpPageAction): HelpPageState => {
    switch (action.type) {
        case SET_HELP_PAGES_AND_CATEGORIES:
            return setHelpPagesAndCategories(state, action);
        case SET_HELP_PAGE:
            return setHelpPage(state, action);
        case SET_HELP_PAGE_LOAD_STATE:
            return setHelpPageLoadState(state, action);
        default:
            return state;
    }
};