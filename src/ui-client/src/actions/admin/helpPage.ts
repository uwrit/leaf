/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppState } from '../../models/state/AppState';
import { showInfoModal, setNoClickModalState, setSideNotificationState, showConfirmationModal } from '../generalUi';
import { InformationModalState, NotificationStates, ConfirmationModalState } from "../../models/state/GeneralUiState";
import { CreateHelpPage, UpdateHelpPageContent, UpdateHelpPageContentDTO, AdminHelpEditContentDTO } from '../../models/admin/Help';
// import { AdminHelpPane } from '../../models/state/AdminHelpState';
import { createAdminHelpPageAndContent, deleteAdminHelpPageAndContent, getAdminHelpPageAndContent, updateAdminHelpPageAndContent } from '../../services/admin/helpPagesApi';

import { fetchSingleHelpPageContent, resetHelpPageContent, setCurrentHelpPage, setHelpPagesAndCategories } from '../helpPage';
import { HelpPage } from '../../models/Help/Help';
import { HelpPageLoadState } from '../../models/state/HelpState';
import { fetchHelpPageContent, fetchHelpPageCategories, fetchHelpPages } from '../../services/helpPagesApi';

export const SET_ADMIN_HELP_PANE = 'SET_ADMIN_HELP_PANE';
export const SET_ADMIN_HELP_LOAD_STATE = 'SET_ADMIN_HELP_LOAD_STATE';

export const CREATE_ADMIN_HELP_PAGE = 'CREATE_ADMIN_HELP_PAGE';
export const SET_ADMIN_HELP_CONTENT = 'SET_ADMIN_HELP_CONTENT';
export const SET_CURRENT_ADMIN_HELP_CONTENT = 'SET_CURRENT_ADMIN_HELP_CONTENT';
export const UPDATE_ADMIN_HELP_CONTENT = 'UPDATE_ADMIN_HELP_CONTENT';
export const SAVE_ADMIN_HELP_CONTENT = 'SAVE_ADMIN_HELP_CONTENT';
export const IS_ADMIN_HELP_CONTENT_NEW = 'IS_ADMIN_HELP_CONTENT_NEW';

export interface AdminHelpAction {
    currentContent?: AdminHelpEditContentDTO;
    content?: AdminHelpEditContentDTO;
    contentLoadState?: HelpPageLoadState;
    createNew?: boolean;
    unsaved?: boolean;
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
                
                dispatch(setCurrentAdminHelpContent(content));
                dispatch(setAdminHelpContent(content, HelpPageLoadState.LOADED));

                dispatch(adminHelpContentUnsaved(false));

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
export const createAdminHelpPageContent = (contentRows: CreateHelpPage[]) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        // might not need check for active pane since update will only exist on that content pane
        if (state.auth.userContext!.isAdmin) {
            try {
                
                dispatch(setNoClickModalState({ message: "Creating Page", state: NotificationStates.Working }));
                
                // Create content.
                const content = await createAdminHelpPageAndContent(getState(), contentRows);

                dispatch(setCurrentAdminHelpContent(content));
                dispatch(setAdminHelpContent(content, HelpPageLoadState.LOADED));

                const pageId = content.content[0].pageId;
                dispatch(reloadContent(pageId));

                dispatch(isAdminHelpContentNew(false));
                dispatch(adminHelpContentUnsaved(false));
                
                // dispatch(createAdminHelpPage(page));
                dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Page Created' }));
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            } catch (err) {
                const info: InformationModalState = {
                    body: "Leaf encountered an error while attempting to create Admin data. Please check the Leaf log files for more information.",
                    header: "Error Creating Admin Data",
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
export const updateAdminHelpPageContent = (contentRows: UpdateHelpPageContent[]) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const pageId = contentRows[0].pageId;
        // might not need check for user being admin since this only runs on admin page
        if (state.auth.userContext!.isAdmin) {
            try {

                dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));

                const content = await updateAdminHelpPageAndContent(state, pageId, contentRows);
                
                dispatch(setCurrentAdminHelpContent(content));
                dispatch(setAdminHelpContent(content, HelpPageLoadState.LOADED));
                
                dispatch(reloadContent());
                dispatch(adminHelpContentUnsaved(false));

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

export const reloadContent = (pageId?: string) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            const categories = await fetchHelpPageCategories(state);
            const pages = await fetchHelpPages(state);
            
            dispatch(setHelpPagesAndCategories(categories, pages));

            if (pageId) {
                const page = pages.find(p => p.id == pageId)!;
                dispatch(setCurrentHelpPage(page));
            }
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
            // First reset admin content.
            dispatch(resetAdminHelpContent());

            // Delete help page.
            await deleteAdminHelpPageAndContent(state, page.id);
            
            // Fetch updated categories and pages after page delete.
            const categories = await fetchHelpPageCategories(state);
            const pages = await fetchHelpPages(state);
            
            // Set new categories and pages.
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
            // Unsaved content set to false
            dispatch(isAdminHelpContentNew(false));

            // Set current help page to empty.
            dispatch(setCurrentHelpPage({} as HelpPage));

            // Set current admin help content to empty.
            dispatch(setCurrentAdminHelpContent({} as AdminHelpEditContentDTO));

            // Set admin help content to empty.
            // Set admin help content load state to NOT_LOADED.
            dispatch(setAdminHelpContent({} as AdminHelpEditContentDTO, HelpPageLoadState.NOT_LOADED));
        } catch (err) {
            console.log(err);
        }
    };
};

/*
 * Handle switching between Admin Help Panel views. Prevents
 * view pane changes if admin has unsaved changes.
 */
export const confirmLeavingAdminHelpContent = () => {
    return async (dispatch: any) => {
        const confirm: ConfirmationModalState = {
            body: 'Are you sure you want to go back? This will delete your current changes if it is not saved.',
            header: 'Go Back',
            onClickNo: () => null,
            onClickYes: () => { dispatch(resetAdminHelpContent()); },
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Go Back`
        };
        dispatch(showConfirmationModal(confirm));
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

export const setCurrentAdminHelpContent = (currentContent: AdminHelpEditContentDTO): AdminHelpAction => {
    return {
        currentContent,
        type: SET_CURRENT_ADMIN_HELP_CONTENT
    };
};

export const setAdminHelpContent = (content: AdminHelpEditContentDTO, contentLoadState: HelpPageLoadState): AdminHelpAction => {
    return {
        content,
        contentLoadState,
        type: SET_ADMIN_HELP_CONTENT
    };
};

export const isAdminHelpContentNew = (createNew: boolean): AdminHelpAction => {
    return {
        createNew: createNew,
        type: IS_ADMIN_HELP_CONTENT_NEW
    };
};

export const adminHelpContentUnsaved = (unsaved: boolean): AdminHelpAction => {
    return {
        unsaved: unsaved,
        type: SAVE_ADMIN_HELP_CONTENT
    };
};
// export const setAdminHelpPane = (pane: number): AdminHelpAction => {
//     return {
//         pane,
//         type: SET_ADMIN_HELP_PANE
//     };
// };