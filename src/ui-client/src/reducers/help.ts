/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import {
    SET_HELP_PAGES,
    SET_HELP_PAGE,
    SET_HELP_PAGE_CATEGORIES,
    SET_HELP_PAGE_LOAD_STATE
} from '../actions/helpPages';
import { HelpPagesAction } from '../actions/helpPages';
import { HelpPagesLoadState, HelpPagesState } from '../models/state/HelpState';
import { HelpPages, HelpPageContent, HelpPageCategory } from '../models/Help/HelpPages';

export const defaultHelpPagesState = (): HelpPagesState => {
    return {
        pages: [],
        pageCategory: [],
        pageContent: [],
        state: HelpPagesLoadState.NOT_LOADED
    }
};

const setHelpPageLoadState = (state: HelpPagesState, loadState: HelpPagesLoadState): HelpPagesState => {
    return Object.assign({}, state, {
        state: loadState
    });
};

const addHelpPages = (state: HelpPagesState, pages: HelpPages[]): HelpPagesState => {
    return Object.assign({}, state, {
        pages: pages
    });
};

const addHelpPage = (state: HelpPagesState, content: HelpPageContent[]): HelpPagesState => {
    return Object.assign({}, state, {
        pageContent: content
    });
};

const addHelpPageCategories = (state: HelpPagesState, category: HelpPageCategory[]): HelpPagesState => {
    return Object.assign({}, state, {
        pageCategory: category
    });
};

export const help = (state: HelpPagesState = defaultHelpPagesState(), action: HelpPagesAction): HelpPagesState => {
    switch (action.type) {
        case SET_HELP_PAGE_LOAD_STATE:
            return setHelpPageLoadState(state, action.state!);
        case SET_HELP_PAGES:
            return addHelpPages(state, action.pages!);
        case SET_HELP_PAGE:
            return addHelpPage(state, action.pageContent!);
        case SET_HELP_PAGE_CATEGORIES:
            return addHelpPageCategories(state, action.pageCategory!);
        default:
            return state;
    }
};