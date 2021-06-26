/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppState } from '../../models/state/AppState';
import { showInfoModal, setNoClickModalState, setSideNotificationState } from '../generalUi';
import { InformationModalState, NotificationStates } from "../../models/state/GeneralUiState";
import { CreateHelpPage, UpdateHelpPageContent, UpdateHelpPageContentDTO, AdminHelpContentDTO } from '../../models/admin/Help';
// import { AdminHelpPane } from '../../models/state/AdminHelpState';
import { createAdminHelpPageAndContent, deleteAdminHelpPageAndContent, getAdminHelpPageAndContent, updateAdminHelpPageAndContent } from '../../services/admin/helpPagesApi';

import { fetchSingleHelpPageContent, resetHelpPageContent, setCurrentHelpPage, setHelpPageAndcontent, setHelpPagesAndCategories } from '../helpPage';
import { HelpPage } from '../../models/Help/Help';
import { HelpPageLoadState } from '../../models/state/HelpState';
import { fetchHelpPageContent, fetchHelpPageCategories, fetchHelpPages } from '../../services/helpPagesApi';

export const SET_ADMIN_HELP_PANE = 'SET_ADMIN_HELP_PANE';
export const SET_ADMIN_HELP_LOAD_STATE = 'SET_ADMIN_HELP_LOAD_STATE';

export const CREATE_ADMIN_HELP_PAGE = 'CREATE_ADMIN_HELP_PAGE';
export const SET_ADMIN_HELP_CONTENT = 'SET_ADMIN_HELP_CONTENT';
export const UPDATE_ADMIN_HELP_CONTENT = 'UPDATE_ADMIN_HELP_CONTENT';
export const SAVE_ADMIN_HELP_CONTENT = 'SAVE_ADMIN_HELP_CONTENT';

export interface AdminHelpAction {
    // changed?: boolean;
    content?: AdminHelpContentDTO;
    contentLoadState?: HelpPageLoadState;
    // page?: CreateHelpPage;
    // pane?: AdminHelpPane;
    type: string;
}

// Asynchronous
/*
 * Get admin help page content.
 */
export const getAdminHelpPageContent = (page: HelpPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        // might not need check for active pane since update will only exist on that content pane
        // if (state.auth.userContext!.isAdmin && state.admin!.help.activePane === AdminHelpPane.CONTENT) {
        if (state.auth.userContext!.isAdmin) {
            try {
                dispatch(setNoClickModalState({ message: "Loading Page", state: NotificationStates.Working }));

                dispatch(setCurrentHelpPage(page));

                const content = await getAdminHelpPageAndContent(state, page.id);
                dispatch(setAdminHelpContent(content, HelpPageLoadState.LOADED));

                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            } catch (err) {
                const info: InformationModalState = {
                    body: "Leaf encountered an error while attempting to load Admin data. Please check the Leaf log files for more information.",
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
 * Create admin help page content.
 */
// export const createAdminHelpPageContent = (content: CreateHelpPage) => {
//     return async (dispatch: any, getState: () => AppState) => {
//         const state = getState();
//         // might not need check for active pane since update will only exist on that content pane
//         if (state.auth.userContext!.isAdmin && state.admin!.help.activePane === AdminHelpPane.PAGE) {
//             try {
//                 // Update content.
//                 const page = await createAdminHelpPageAndContent(getState(), content);
                
//                 dispatch(setNoClickModalState({ message: "Creating", state: NotificationStates.Working }));
//                 dispatch(createAdminHelpPage(page));
                
//                 dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
//             } catch (err) {
//                 const info: InformationModalState = {
//                     body: "Leaf encountered an error while attempting to create Admin data. Please check the Leaf log files for more information.",
//                     header: "Error Loading Admin Data",
//                     show: true
//                 };
//                 dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
//                 dispatch(showInfoModal(info));
//             }
//         }
//     };
// };

/*
 * Update admin help page content.
 */
export const updateAdminHelpPageContent = (contentRows: UpdateHelpPageContent[]) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const pageId = contentRows[0].pageId;
        // might not need check for user being admin since this only runs on admin page
        if (state.auth.userContext!.isAdmin) {
            try {

                dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));

                console.log(contentRows);
                const content = await updateAdminHelpPageAndContent(state, pageId, contentRows);
                
                dispatch(setAdminHelpContent(content, HelpPageLoadState.LOADED));
                
                dispatch(reloadContent());

                dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Page Saved' }));
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            } catch (err) {
                const info: InformationModalState = {
                    body: "Leaf encountered an error while attempting to update Admin data. Please check the Leaf log files for more information.",
                    header: "Error Updating Admin Data",
                    show: true
                };
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                dispatch(showInfoModal(info));
            }
        }
    };
};

export const reloadContent = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            const categories = await fetchHelpPageCategories(state);
            const pages = await fetchHelpPages(state);
            
            dispatch(setHelpPagesAndCategories(categories, pages));
        } catch (err) {
            const info: InformationModalState = {
                body: "Leaf encountered an error while attempting to load Admin data. Please check the Leaf log files for more information.",
                header: "Error Loading Admin Data",
                show: true
            };
            dispatch(showInfoModal(info));
        }
    }
}

export const deleteHelpPageAndContent = (page: HelpPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            await deleteAdminHelpPageAndContent(state, page.id);
            
            const categories = await fetchHelpPageCategories(state);
            const pages = await fetchHelpPages(state);
            
            dispatch(resetAdminHelpContent());
            dispatch(setHelpPagesAndCategories(categories, pages));
        
        const info: InformationModalState = {
            body: `"${page.title}" page deleted.`,
            header: "Deleting Page",
            show: true
        };
        dispatch(showInfoModal(info));
        } catch (err) {
            const info: InformationModalState = {
                body: "Leaf encountered an error while attempting to delete help page. Please check the Leaf log files for more information.",
                header: "Error Deleting Help Page",
                show: true
            };
            dispatch(showInfoModal(info));
        };
    };
};

export const resetAdminHelpContent = () => {
    return (dispatch: any) => {
        try {
            // Set current help page to empty.
            dispatch(setCurrentHelpPage({} as HelpPage));

            // Set admin help content to empty.
            // Set admin help content load state to NOT_LOADED.
            dispatch(setAdminHelpContent({} as AdminHelpContentDTO, HelpPageLoadState.NOT_LOADED));
        } catch (err) {
            console.log(err);
        }
    };
};

/*
 * Handle switching between Admin Help Panel views. Prevents
 * view pane changes if admin has unsaved changes.
 */
export const checkIfAdminHelpContentUnsaved = (unsaved: boolean) => {
    return async (dispatch: any) => {
        if (unsaved) {
            const info: InformationModalState = {
                body: "Please save or undo your current changes first.",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        } else {
            // Set current help page to empty.
            dispatch(setCurrentHelpPage({} as HelpPage));

            // Set admin help content to empty.
            // Set admin help content load state to NOT_LOADED.
            dispatch(setAdminHelpContent({} as AdminHelpContentDTO, HelpPageLoadState.NOT_LOADED));
        };
    };
};

// Synchronous
// export const createAdminHelpPage = (page: CreateHelpPage): AdminHelpAction => {
//     return {
//         page,
//         type: CREATE_ADMIN_HELP_PAGE
//     };
// };

// export const setAdminHelpContent = (content: UpdateHelpPageContentDTO): AdminHelpAction => {
//     return {
//         content,
//         type: SET_ADMIN_HELP_CONTENT
//     };
// };

export const setAdminHelpContent = (content: AdminHelpContentDTO, contentLoadState: HelpPageLoadState): AdminHelpAction => {
    return {
        content,
        contentLoadState,
        type: SET_ADMIN_HELP_CONTENT
    };
};

// export const setAdminHelpPane = (pane: number): AdminHelpAction => {
//     return {
//         pane,
//         type: SET_ADMIN_HELP_PANE
//     };
// };