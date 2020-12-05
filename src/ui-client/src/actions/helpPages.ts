/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { InformationModalState, NotificationStates } from "../models/state/GeneralUiState";
import { showInfoModal, setNoClickModalState } from "./generalUi";
import { HelpPagesLoadState } from '../models/state/HelpState';
import { HelpPages, HelpPageContent, HelpPageCategory } from '../models/Help/HelpPages';
import { fetchHelpPages, fetchHelpPageContent, fetchHelpPageCategories } from '../services/helpPagesApi';

export const SET_HELP_PAGE = 'SET_HELP_PAGE';
export const SET_HELP_PAGES = 'SET_HELP_PAGES';
export const SET_HELP_PAGE_CATEGORIES = 'SET_HELP_PAGE_CATEGORIES';
export const SET_HELP_PAGE_LOAD_STATE = 'SET_HELP_PAGE_LOAD_STATE';

export interface HelpPagesAction {
    pages?: HelpPages[];
    pageCategory?: HelpPageCategory[];
    pageContent?: HelpPageContent[];
    state?: HelpPagesLoadState;
    type: string;
}

// Async actions

/*
 * Fetch help pages and categories if it hasn't already been loaded.
 */
export const loadHelpPagesAndCategoriesIfNeeded = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        if (state.help.state === HelpPagesLoadState.NOT_LOADED) {
            try {
                dispatch(setNoClickModalState({ message: "Loading", state: NotificationStates.Working }));

                /*
                 * Fetch all help pages.
                 */
                const pages = await fetchHelpPages(getState());
                dispatch(addHelpPages(pages));

                /*
                 * Fetch help page categories.
                 */
                const categories = await fetchHelpPageCategories(getState());
                dispatch(addHelpPageCategories(categories));

                /*
                 * Finish.
                 */
                dispatch(setHelpPageLoadState(HelpPagesLoadState.LOADED));
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            } catch (err) {
                const info: InformationModalState = {
                    body: "Leaf encountered an error while attempting to load Help pages. Please check the Leaf log files for more information.",
                    header: "Error Loading Help Pages",
                    show: true
                };
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                dispatch(showInfoModal(info));
            }
        }
    };
};

/*
 * Fetch all help pages.
 */
export const fetchAllHelpPages = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        try {
            const response = await fetchHelpPages(getState());
            dispatch(addHelpPages(response));
        } catch (err) {
            console.log(err);
        }
    };
};

/*
 * Fetch help page categories.
 */
export const fetchAllHelpPageCategories = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        try {
            const response = await fetchHelpPageCategories(getState());
            dispatch(addHelpPageCategories(response));
        } catch (err) {
            console.log(err);
        }
    };
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
export const setHelpPageLoadState = (state: HelpPagesLoadState): HelpPagesAction => {
    return {
        state,
        type: SET_HELP_PAGE_LOAD_STATE
    };
};

export const addHelpPages = (pages: HelpPages[]): HelpPagesAction => {
    return {
        pages,
        type: SET_HELP_PAGES
    };
};

export const addHelpPage = (page: HelpPageContent[]): HelpPagesAction => {
    return {
        pageContent: page,
        type: SET_HELP_PAGE
    };
};

export const addHelpPageCategories = (category: HelpPageCategory[]): HelpPagesAction => {
    return {
        pageCategory: category,
        type: SET_HELP_PAGE_CATEGORIES
    };
};