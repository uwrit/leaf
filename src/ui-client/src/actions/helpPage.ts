/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { showInfoModal, setNoClickModalState } from "./generalUi";
import { InformationModalState, NotificationStates } from "../models/state/GeneralUiState";
import { HelpPage, HelpPageDTO, HelpPageCategoryDTO, HelpPageContentDTO } from '../models/Help/Help';
import { HelpPageLoadState } from '../models/state/HelpState';
import { fetchHelpPages, fetchHelpPageCategories, fetchHelpPageContent } from '../services/helpPagesApi';

export const SET_HELP_PAGES_AND_CATEGORIES = 'SET_HELP_PAGES_AND_CATEGORIES';
export const SET_CURRENT_HELP_PAGE = 'SET_CURRENT_HELP_PAGE';
export const SET_HELP_PAGE_LOAD_STATE = 'SET_HELP_PAGE_LOAD_STATE';
export const SET_HELP_PAGE_CONTENT = 'SET_HELP_PAGE_CONTENT';

export interface HelpPageAction {
    categories?: HelpPageCategoryDTO[];
    currentSelectedPage?: HelpPage;
    pages?: HelpPageDTO[];
    state?: HelpPageLoadState;
    type: string;
}

export interface HelpPageContentAction {
    content?: HelpPageContentDTO[];
    state?: HelpPageLoadState;
    type: string;
}

// Async actions
/*
 * Fetch help pages and categories if it hasn't already been loaded.
 */
export const loadHelpPagesAndCategoriesIfNeeded = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        if (state.helpPage.state === HelpPageLoadState.NOT_LOADED) {
            try {
                dispatch(setNoClickModalState({ message: "Loading", state: NotificationStates.Working }));

                /*
                 * Fetch help pages and categories.
                 */
                const categories = await fetchHelpPageCategories(getState());
                const pages = await fetchHelpPages(getState());

                console.log(categories, pages);

                dispatch(setHelpPagesAndCategories(categories, pages));

                /*
                 * Finish.
                 */
                dispatch(setHelpPageLoadState(HelpPageLoadState.LOADED));
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
 * Fetch a single help page and its content.
 */
export const fetchSingleHelpPageContent = (page: HelpPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            dispatch(setNoClickModalState({ message: "Loading", state: NotificationStates.Working }));

            dispatch(setCurrentHelpPage(page));
            
            // Fetch help page content.
            const content = await fetchHelpPageContent(state, page.id);
            
            dispatch(setHelpPageContent(HelpPageLoadState.LOADED, content));
            
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
        } catch (err) {
            const info: InformationModalState = {
                body: "Leaf encountered an error while attempting to load Help page content. Please check the Leaf log files for more information.",
                header: "Error Loading Help Page Content",
                show: true
            };
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    };
};

/*
 * Function called to reset content that's loaded already or clearing content to load another.
 */
export const resetHelpPageContent = () => {
    return (dispatch: any) => {
        try {
            // Set page content load state to NOT_LOADED.
            dispatch(setHelpPageContent(HelpPageLoadState.NOT_LOADED));
            // Set current help page to empty.
            dispatch(setCurrentHelpPage({} as HelpPage));
        } catch (err) {
            console.log(err);
        }
    };
};

// Synchronous actions
export const setHelpPagesAndCategories = (categories: HelpPageCategoryDTO[], pages: HelpPageDTO[]): HelpPageAction => {
    return {
        categories,
        pages,
        type: SET_HELP_PAGES_AND_CATEGORIES
    };
};

export const setCurrentHelpPage = (currentSelectedPage: HelpPage): HelpPageAction => {
    return {
        currentSelectedPage,
        type: SET_CURRENT_HELP_PAGE
    };
};

export const setHelpPageLoadState = (state: HelpPageLoadState): HelpPageAction => {
    return {
        state,
        type: SET_HELP_PAGE_LOAD_STATE
    };
};

export const setHelpPageContent = (state: HelpPageLoadState, content?: HelpPageContentDTO[]): HelpPageContentAction => {
    return {
        content,
        state,
        type: SET_HELP_PAGE_CONTENT
    };
};