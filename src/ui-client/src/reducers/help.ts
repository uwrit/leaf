/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import {
    SET_HELP_PAGES,
    SET_HELP_PAGE_CATEGORIES,
    SET_HELP_PAGE_LOAD_STATE
} from '../actions/help/helpPages';
import {
    SET_HELP_PAGE_CONTENT,
    SET_HELP_PAGE_CONTENT_TO_EMPTY,
    SET_HELP_PAGE_CONTENT_LOAD_STATE
} from '../actions/help/helpPageContent';
import { HelpPagesAction } from '../actions/help/helpPages';
import { HelpPageContentAction } from '../actions/help/helpPageContent';
import { HelpPageLoadState, HelpPagesState } from '../models/state/HelpState';

export const defaultHelpPagesState = (): HelpPagesState => {
    return {
        pages: [],
        pageCategory: [],
        pageContent: {
            content: [],
            state: HelpPageLoadState.NOT_LOADED
        },
        state: HelpPageLoadState.NOT_LOADED
    }
};

const addHelpPages = (state: HelpPagesState, action: HelpPagesAction): HelpPagesState => {
    return Object.assign({}, state, {
        pages: action.pages
    });
};

const addHelpPageCategories = (state: HelpPagesState, action: HelpPagesAction): HelpPagesState => {
    return Object.assign({}, state, {
        pageCategory: action.pageCategory
    });
};

const setHelpPageLoadState = (state: HelpPagesState, action: HelpPagesAction): HelpPagesState => {
    return Object.assign({}, state, {
        state: action.state
    });
};

const addHelpPageContent = (state: HelpPagesState, action: HelpPageContentAction): HelpPagesState => {
    return Object.assign({}, state, {
        pageContent: {
            ...state.pageContent,
            content: action.content
        }
    });
};

const setHelpPageContentToEmpty = (state: HelpPagesState, action: HelpPageContentAction): HelpPagesState => {
    return Object.assign({}, state, {
        pageContent: {
            ...state.pageContent,
            content: action.content
        }
    });
};

const setHelpPageContentLoadState = (state: HelpPagesState, action: HelpPageContentAction): HelpPagesState => {
    return Object.assign({}, state, {
        pageContent: {
            ...state.pageContent,
            state: action.state
        }
    });
};

type HelpAction = HelpPagesAction | HelpPageContentAction;

export const help = (state: HelpPagesState = defaultHelpPagesState(), action: HelpAction): HelpPagesState => {
    switch (action.type) {
        case SET_HELP_PAGES:
            return addHelpPages(state, action);
        case SET_HELP_PAGE_CATEGORIES:
            return addHelpPageCategories(state, action);
        case SET_HELP_PAGE_LOAD_STATE:
            return setHelpPageLoadState(state, action);
        case SET_HELP_PAGE_CONTENT:
            return addHelpPageContent(state, action);
        case SET_HELP_PAGE_CONTENT_LOAD_STATE:
            return setHelpPageContentLoadState(state, action);
        case SET_HELP_PAGE_CONTENT_TO_EMPTY:
            return setHelpPageContentToEmpty(state, action);
        default:
            return state;
    }
};