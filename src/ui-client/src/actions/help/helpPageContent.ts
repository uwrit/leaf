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
import { HelpPageContentDTO } from '../../models/Help/Help';
import { fetchHelpPageContent } from '../../services/helpPagesApi';

export const SET_HELP_PAGE_CONTENT = 'SET_HELP_PAGE_CONTENT';
export const SET_HELP_PAGE_CONTENT_TO_EMPTY = 'SET_HELP_PAGE_CONTENT_TO_EMPTY';
export const SET_HELP_PAGE_CONTENT_LOAD_STATE = 'SET_HELP_PAGE_CONTENT_LOAD_STATE';

export interface HelpPageContentAction {
    content?: HelpPageContentDTO[];
    state?: HelpPageLoadState;
    type: string;
}

// Async actions

/*
 * Fetch a single help page and its content.
 */
export const fetchSingleHelpPageContent = (pageId: number) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        if (state.help.content.state === HelpPageLoadState.NOT_LOADED) {
            try {
                dispatch(setNoClickModalState({ message: "Loading", state: NotificationStates.Working }));

                /*
                 * Fetch help page content.
                 */
                const content = await fetchHelpPageContent(getState(), pageId);
                dispatch(setHelpPageContent(content));

                /*
                 * Finish.
                 */
                dispatch(setHelpPageContentLoadState(HelpPageLoadState.LOADED));
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
        }
    };
};

export const resetHelpPageContent = () => {
    return (dispatch: any) => {
        try {
            // Set page content load state to NOT_LOADED.
            dispatch(setHelpPageContentLoadState(HelpPageLoadState.NOT_LOADED));
        
            // Reset existing page content to empty for new page content to load.
            const content = [] as HelpPageContentDTO[];
            dispatch(setHelpPageContentToEmpty(content));
        } catch (err) {
            console.log(err);
        }
    };
};

// Synchronous actions
export const setHelpPageContent = (content: HelpPageContentDTO[]): HelpPageContentAction => {
    return {
        content,
        type: SET_HELP_PAGE_CONTENT
    };
};

export const setHelpPageContentToEmpty = (content: HelpPageContentDTO[]): HelpPageContentAction => {
    return {
        content,
        type: SET_HELP_PAGE_CONTENT_TO_EMPTY
    };
};

export const setHelpPageContentLoadState = (state: HelpPageLoadState): HelpPageContentAction => {
    return {
        state,
        type: SET_HELP_PAGE_CONTENT_LOAD_STATE
    };
};