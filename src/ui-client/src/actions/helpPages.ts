/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';

import { HelpPages, HelpPageContent } from '../models/Help/HelpPages';
import { fetchHelpPages, fetchHelpPageContent } from '../services/helpPagesApi';

export const SET_HELP_PAGE = 'SET_HELP_PAGE';
export const SET_HELP_PAGES = 'SET_HELP_PAGES';

export interface HelpPagesAction {
    pages?: HelpPages[];
    pageContent?: HelpPageContent;
    type: string;
}

// Async actions
/*
 * Request help pages.
 */
export const requestHelpPages = async (dispatch: any, getState: () => AppState) => {
    const state = getState();
    const response = await fetchHelpPages(state);
    const pages = response.data.pages as HelpPages[];
    dispatch(addHelpPages(pages));
};

/*
 * Fetch a single help page and its content.
 */
export const fetchSingleHelpPage = (pageId: number) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        try {
            const response = await fetchHelpPageContent(getState(), pageId);
            dispatch(addHelpPage(response));
        } catch (err) {
            console.log(err);
        }
    };
};

// Synchronous actions
export const addHelpPages = (pages: HelpPages[]): HelpPagesAction => {
    return {
        pages,
        type: SET_HELP_PAGES
    };
};

export const addHelpPage = (page: HelpPageContent): HelpPagesAction => {
    return {
        pageContent: page,
        type: SET_HELP_PAGE
    };
};