/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { InformationModalState, NotificationStates } from "../../models/state/GeneralUiState";
import { showInfoModal, setNoClickModalState } from "../generalUi";
import { HelpPageLoadState, PairedState } from '../../models/state/HelpState';
import { HelpPage, HelpPageCategory, HelpPageCategoryPair } from '../../models/Help/HelpPages';
import { fetchHelpPages, fetchHelpPageCategories } from '../../services/helpPagesApi';

export const SET_HELP_PAGES = 'SET_HELP_PAGES';
export const SET_HELP_PAGE_CATEGORIES = 'SET_HELP_PAGE_CATEGORIES';
export const SET_HELP_PAGE_LOAD_STATE = 'SET_HELP_PAGE_LOAD_STATE';
export const PAIR_HELP_PAGES_AND_CATEGORIES = 'PAIR_HELP_PAGES_AND_CATEGORIES';
export const IS_PAIRED = 'IS_PAIRED';

export interface HelpPagesAction {
    pages?: HelpPage[];
    categories?: HelpPageCategory[];
    pairedPagesCategories?: HelpPageCategoryPair[];
    paired?: PairedState;
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
                dispatch(setHelpPages(pages));

                /*
                 * Fetch help page categories.
                 */
                const categories = await fetchHelpPageCategories(getState());
                dispatch(setHelpPageCategories(categories));

                /*
                 * Finish.
                 */
                dispatch(setHelpPageLoadState(HelpPageLoadState.LOADED));
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));

                /*
                 * After pages are loaded, pair up pages and categories.
                 */
                dispatch(pairPagesAndCategories());
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

export const pairPagesAndCategories = () => {
    return (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const pairs = [] as HelpPageCategoryPair[];

        if (state.help.state === HelpPageLoadState.LOADED && state.help.paired === PairedState.NOT_PAIRED) {
            state.help.categories.map(c => {
                const pages = [] as HelpPage[];
                
                state.help.pages.map(p =>
                    (p.categoryId === c.id) && pages.push(p)
                )

                pairs.push({
                    category: c.category,
                    pages: pages
                })
            })
            
            dispatch(pairHelpPagesAndCategories(pairs));
            dispatch(isPaired(PairedState.PAIRED));
        }
    };
};

// Synchronous actions
export const isPaired = (paired: PairedState): HelpPagesAction => {
    return {
        paired,
        type: IS_PAIRED
    };
};

export const pairHelpPagesAndCategories = (pairedPagesCategories: HelpPageCategoryPair[]): HelpPagesAction => {
    return {
        pairedPagesCategories,
        type: PAIR_HELP_PAGES_AND_CATEGORIES
    };
};

export const setHelpPageLoadState = (state: HelpPageLoadState): HelpPagesAction => {
    return {
        state,
        type: SET_HELP_PAGE_LOAD_STATE
    };
};

export const setHelpPages = (pages: HelpPage[]): HelpPagesAction => {
    return {
        pages,
        type: SET_HELP_PAGES
    };
};

export const setHelpPageCategories = (categories: HelpPageCategory[]): HelpPagesAction => {
    return {
        categories,
        type: SET_HELP_PAGE_CATEGORIES
    };
};