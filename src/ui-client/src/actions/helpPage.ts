/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { showInfoModal, setNoClickModalState } from "./generalUi";
import { InformationModalState, NotificationStates } from "../models/state/GeneralUiState";
import { HelpCategoryPageCache, HelpPage, HelpPageCategory, PartialHelpPage } from '../models/help/Help';
import { HelpPageLoadState } from '../models/state/HelpState';
import { fetchHelpPageCategories, fetchHelpPageContent, fetchPartialHelpPages } from '../services/helpPagesApi';

export const SET_HELP_PAGE = 'SET_HELP_PAGE';
export const SET_HELP_PAGES_AND_CATEGORIES = 'SET_HELP_PAGES_AND_CATEGORIES';
export const SET_HELP_PAGE_LOAD_STATE = 'SET_HELP_PAGE_LOAD_STATE';

export interface HelpPageAction {
    categories?: HelpPageCategory[];
    page?: HelpPage;
    partialPages?: PartialHelpPage[];
    state?: HelpPageLoadState;
    type: string;
}

// Async actions
/*
 * Fetch help pages and categories if it isn't loaded.
 */
export const loadHelpPagesAndCategoriesIfNeeded = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        if (state.help.state === HelpPageLoadState.NOT_LOADED) {
            try {
                dispatch(setNoClickModalState({ message: "Loading", state: NotificationStates.Working }));

                /*
                 * Fetch help pages and categories.
                 */
                const categories = await fetchHelpPageCategories(state);
                const partialPages = await fetchPartialHelpPages(state);

                dispatch(setHelpPagesAndCategories(categories, partialPages));
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
export const fetchSingleHelpPageContent = (p: PartialHelpPage, category: HelpCategoryPageCache) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            dispatch(setNoClickModalState({ message: "Loading", state: NotificationStates.Working }));
            
            // Fetch help page content.
            const contentRows = await fetchHelpPageContent(state, p.id);
            const page = {
                id: p.id,
                title: p.title,
                category: { id: category.id, name: category.name },
                content: contentRows,
                contentState: HelpPageLoadState.LOADED
            } as HelpPage;
            
            dispatch(setHelpPage(page));
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
            // Set help page to empty.
            dispatch(setHelpPage({} as HelpPage));
        } catch (err) {
            console.log(err);
        }
    };
};

// Synchronous actions
export const setHelpPagesAndCategories = (categories: HelpPageCategory[], partialPages: PartialHelpPage[]): HelpPageAction => {
    return {
        categories: categories,
        partialPages: partialPages,
        type: SET_HELP_PAGES_AND_CATEGORIES
    };
};

export const setHelpPage = (page: HelpPage): HelpPageAction => {
    return {
        page: page,
        type: SET_HELP_PAGE
    };
};

export const setHelpPageLoadState = (state: HelpPageLoadState): HelpPageAction => {
    return {
        state: state,
        type: SET_HELP_PAGE_LOAD_STATE
    };
};