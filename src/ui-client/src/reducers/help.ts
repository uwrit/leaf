/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import {
    SET_HELP_PAGES,
    SET_HELP_PAGE_CATEGORIES,
    SET_HELP_PAGE_LOAD_STATE,
    PAIR_HELP_PAGES_AND_CATEGORIES,
    IS_PAIRED
} from '../actions/help/helpPages';
import {
    SET_HELP_PAGE_CONTENT,
    SET_HELP_PAGE_CONTENT_TO_EMPTY,
    SET_HELP_PAGE_CONTENT_LOAD_STATE
} from '../actions/help/helpPageContent';
import { HelpPagesAction } from '../actions/help/helpPages';
import { HelpPageContentAction } from '../actions/help/helpPageContent';
import { HelpPageLoadState, PairedState, HelpPagesState } from '../models/state/HelpState';

export const defaultHelpPagesState = (): HelpPagesState => {
    return {
        pages: [],
        categories: [],
        content: {
            content: [],
            state: HelpPageLoadState.NOT_LOADED
        },
        pairedPagesCategories: [],
        paired: PairedState.NOT_PAIRED,
        state: HelpPageLoadState.NOT_LOADED
    }
};

const isPaired = (state: HelpPagesState, action: HelpPagesAction): HelpPagesState => {
    return Object.assign({}, state, {
        paired: action.paired
    });
};

const pairHelpPagesAndCategories = (state: HelpPagesState, action: HelpPagesAction): HelpPagesState => {
    return Object.assign({}, state, {
        pairedPagesCategories: action.pairedPagesCategories
    });
};

const setHelpPages = (state: HelpPagesState, action: HelpPagesAction): HelpPagesState => {
    return Object.assign({}, state, {
        pages: action.pages
    });
};

const setHelpPageCategories = (state: HelpPagesState, action: HelpPagesAction): HelpPagesState => {
    return Object.assign({}, state, {
        categories: action.categories
    });
};

const setHelpPageLoadState = (state: HelpPagesState, action: HelpPagesAction): HelpPagesState => {
    return Object.assign({}, state, {
        state: action.state
    });
};

const setHelpPageContent = (state: HelpPagesState, action: HelpPageContentAction): HelpPagesState => {
    return Object.assign({}, state, {
        content: {
            ...state.content,
            content: action.content
        }
    });
};

const setHelpPageContentToEmpty = (state: HelpPagesState, action: HelpPageContentAction): HelpPagesState => {
    return Object.assign({}, state, {
        content: {
            ...state.content,
            content: action.content
        }
    });
};

const setHelpPageContentLoadState = (state: HelpPagesState, action: HelpPageContentAction): HelpPagesState => {
    return Object.assign({}, state, {
        content: {
            ...state.content,
            state: action.state
        }
    });
};

type HelpAction = HelpPagesAction | HelpPageContentAction;

export const help = (state: HelpPagesState = defaultHelpPagesState(), action: HelpAction): HelpPagesState => {
    switch (action.type) {
        case SET_HELP_PAGES:
            return setHelpPages(state, action);
        case SET_HELP_PAGE_CATEGORIES:
            return setHelpPageCategories(state, action);
        case SET_HELP_PAGE_LOAD_STATE:
            return setHelpPageLoadState(state, action);
        case SET_HELP_PAGE_CONTENT:
            return setHelpPageContent(state, action);
        case SET_HELP_PAGE_CONTENT_LOAD_STATE:
            return setHelpPageContentLoadState(state, action);
        case SET_HELP_PAGE_CONTENT_TO_EMPTY:
            return setHelpPageContentToEmpty(state, action);
        case PAIR_HELP_PAGES_AND_CATEGORIES:
            return pairHelpPagesAndCategories(state, action);
        case IS_PAIRED:
            return isPaired(state, action);
        default:
            return state;
    }
};