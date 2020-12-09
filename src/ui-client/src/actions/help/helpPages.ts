/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { InformationModalState, NotificationStates } from "../../models/state/GeneralUiState";
import { showInfoModal, setNoClickModalState } from "../generalUi";
import { HelpPageLoadState } from '../../models/state/HelpState';
import { HelpPages, HelpPageCategory } from '../../models/Help/HelpPages';
import { fetchHelpPages, fetchHelpPageCategories } from '../../services/helpPagesApi';

export const SET_HELP_PAGES = 'SET_HELP_PAGES';
export const SET_HELP_PAGE_CATEGORIES = 'SET_HELP_PAGE_CATEGORIES';
export const SET_HELP_PAGE_LOAD_STATE = 'SET_HELP_PAGE_LOAD_STATE';

export interface HelpPagesAction {
    pages?: HelpPages[];
    pageCategory?: HelpPageCategory[];
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
        if (state.help.state === HelpPageLoadState.NOT_LOADED) {
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

// Synchronous actions
export const setHelpPageLoadState = (state: HelpPageLoadState): HelpPagesAction => {
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

export const addHelpPageCategories = (pageCategory: HelpPageCategory[]): HelpPagesAction => {
    return {
        pageCategory,
        type: SET_HELP_PAGE_CATEGORIES
    };
};