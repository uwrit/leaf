/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppState } from '../../models/state/AppState';
import { showInfoModal, setNoClickModalState } from '../generalUi';
import { InformationModalState, NotificationStates } from "../../models/state/GeneralUiState";
import { CreateHelpPage, UpdateHelpPageContent } from '../../models/admin/Help';
import { AdminHelpLoadState, AdminHelpPane } from '../../models/state/AdminHelpState';
import { createAdminHelpPageAndContent, deleteAdminHelpPageAndContent, updateAdminHelpPageAndContent } from '../../services/admin/helpPagesApi';

import { fetchSingleHelpPageContent, resetHelpPageContent, setHelpPageContent } from '../helpPage';
import { HelpPage } from '../../models/Help/Help';
import { HelpPageLoadState } from '../../models/state/HelpState';

export const SET_ADMIN_HELP_PANE = 'SET_ADMIN_HELP_PANE';
export const SET_ADMIN_HELP_LOAD_STATE = 'SET_ADMIN_HELP_LOAD_STATE';

export const CREATE_ADMIN_HELP_PAGE = 'CREATE_ADMIN_HELP_PAGE';
export const UPDATE_ADMIN_HELP_CONTENT = 'UPDATE_ADMIN_HELP_CONTENT';

export interface AdminHelpAction {
    content?: UpdateHelpPageContent;
    page?: CreateHelpPage;
    pane?: AdminHelpPane;
    // state?: AdminHelpLoadState;
    type: string;
}

// Asynchronous
/*
 * Create admin help page content.
 */
export const createAdminHelpPageContent = (content: CreateHelpPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        // might not need check for active pane since update will only exist on that content pane
        if (state.auth.userContext!.isAdmin && state.admin!.help.activePane === AdminHelpPane.PAGE) {
            try {
                // Update content.
                const page = await createAdminHelpPageAndContent(getState(), content);
                
                dispatch(setNoClickModalState({ message: "Creating", state: NotificationStates.Working }));
                dispatch(createAdminHelpPage(page));
                
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            } catch (err) {
                const info: InformationModalState = {
                    body: "Leaf encountered an error while attempting to create Admin data. Please check the Leaf log files for more information.",
                    header: "Error Loading Admin Data",
                    show: true
                };
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                dispatch(showInfoModal(info));
            }
        }
    };
};

/*
 * Update admin help page content.
 */
export const updateAdminHelpPageContent = (content: UpdateHelpPageContent, page: HelpPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        // might not need check for active pane since update will only exist on that content pane
        if (state.auth.userContext!.isAdmin && state.admin!.help.activePane === AdminHelpPane.CONTENT) {
            try {

                dispatch(setNoClickModalState({ message: "Updating", state: NotificationStates.Working }));

                // Update content.
                const cont = await updateAdminHelpPageAndContent(getState(), content);

                dispatch(updateAdminHelpContent(cont));
                
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            } catch (err) {
                const info: InformationModalState = {
                    body: "Leaf encountered an error while attempting to update Admin data. Please check the Leaf log files for more information.",
                    header: "Error Loading Admin Data",
                    show: true
                };
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                dispatch(showInfoModal(info));
            }
        }
    };
};

// export const reloadHelpPageContent = () => {
//     return (dispatch: any) => {
//         try {
//             // Set page content load state to NOT_LOADED.
//             dispatch(setHelpPageContent(HelpPageLoadState.LOADING));
//         } catch (err) {
//             console.log(err);
//         }
//     };
// };

/*
 * Handle switching between Admin Help Panel views. Prevents
 * view pane changes if admin has unsaved changes.
 */
export const checkIfAdminHelpPanelUnsavedAndSetPane = (pane: AdminHelpPane) => {
    return async (dispatch: any, getState: () => AppState) => {
        const admin = getState().admin!;
        if (
            admin.help.helpContent.changed ||
            admin.help.helpPage.changed
        ) {
            const info: InformationModalState = {
                body: "Please save or undo your current changes first.",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        } else {
            dispatch(setAdminHelpPane(pane));
        }
    };
};

// Synchronous
export const createAdminHelpPage = (page: CreateHelpPage): AdminHelpAction => {
    return {
        page,
        type: CREATE_ADMIN_HELP_PAGE
    };
};

export const updateAdminHelpContent = (content: UpdateHelpPageContent): AdminHelpAction => {
    return {
        content,
        type: UPDATE_ADMIN_HELP_CONTENT
    };
};

export const setAdminHelpPane = (pane: number): AdminHelpAction => {
    return {
        pane,
        type: SET_ADMIN_HELP_PANE
    };
};
