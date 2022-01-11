/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppState } from '../../models/state/AppState';
import { showInfoModal, setNoClickModalState, setSideNotificationState, showConfirmationModal } from '../generalUi';
import { setCurrentHelpPage, setHelpPagesAndCategories } from '../helpPage';
import { AdminHelpContent, AdminHelpContentDTO } from '../../models/admin/Help';
import { HelpPage } from '../../models/Help/Help';
import { ConfirmationModalState, InformationModalState, NotificationStates } from "../../models/state/GeneralUiState";
import { HelpPageLoadState } from '../../models/state/HelpState';
import { fetchHelpPageCategories, fetchHelpPages } from '../../services/helpPagesApi';
import { createAdminHelpPageAndContent, deleteAdminHelpPageAndContent, getAdminHelpPageAndContent, updateAdminHelpPageAndContent } from '../../services/admin/helpPagesApi';

export const IS_ADMIN_HELP_CONTENT_NEW = 'IS_ADMIN_HELP_CONTENT_NEW';
export const SAVE_ADMIN_HELP_CONTENT = 'SAVE_ADMIN_HELP_CONTENT';
export const SET_ADMIN_HELP_CONTENT = 'SET_ADMIN_HELP_CONTENT';
export const SET_CURRENT_ADMIN_HELP_CONTENT = 'SET_CURRENT_ADMIN_HELP_CONTENT';

export interface AdminHelpAction {
    currentContent?: AdminHelpContentDTO;
    content?: AdminHelpContentDTO;
    contentLoadState?: HelpPageLoadState;
    isNew?: boolean;
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
        };
    };
};

/*
 * Create admin help page content.
 */
export const createAdminHelpPageContent = (page: AdminHelpContent) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            dispatch(setNoClickModalState({ message: "Creating Page", state: NotificationStates.Working }));
            
            // Create help page.
            const created = await createAdminHelpPageAndContent(state, page);

            dispatch(setCurrentAdminHelpContent(created));
            dispatch(setAdminHelpContent(created, HelpPageLoadState.LOADED));

            const pageId = created.content[0].pageId;
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
        };
    };
};

/*
 * Update admin help page content.
 */
export const updateAdminHelpPageContent = (page: AdminHelpContent, pageId: string) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));

            const content = await updateAdminHelpPageAndContent(state, page, pageId);

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
        };
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
                const page = pages.find(p => p.id === pageId)!;
                dispatch(setCurrentHelpPage(page));
            };
        } catch (err) {
            const info: InformationModalState = {
                body: "Leaf encountered an error while attempting to load Admin data. Please check the Leaf log files for more information.",
                header: "Error Loading Admin Data",
                show: true
            };
            dispatch(showInfoModal(info));
        };
    };
};

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
            // Is content being created set to false.
            dispatch(isAdminHelpContentNew(false));

            // Content unsaved set to false
            dispatch(adminHelpContentUnsaved(false));

            // Set current help page to empty.
            dispatch(setCurrentHelpPage({} as HelpPage));

            // Set current admin help content to empty.
            dispatch(setCurrentAdminHelpContent({} as AdminHelpContentDTO));

            // Set admin help content to empty and load state to NOT_LOADED.
            dispatch(setAdminHelpContent({} as AdminHelpContentDTO, HelpPageLoadState.NOT_LOADED));
        } catch (err) {
            console.log(err);
        };
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
export const setCurrentAdminHelpContent = (currentContent: AdminHelpContentDTO): AdminHelpAction => {
    return {
        currentContent,
        type: SET_CURRENT_ADMIN_HELP_CONTENT
    };
};

export const setAdminHelpContent = (content: AdminHelpContentDTO, contentLoadState: HelpPageLoadState): AdminHelpAction => {
    return {
        content,
        contentLoadState,
        type: SET_ADMIN_HELP_CONTENT
    };
};

export const isAdminHelpContentNew = (isNew: boolean): AdminHelpAction => {
    return {
        isNew: isNew,
        type: IS_ADMIN_HELP_CONTENT_NEW
    };
};

export const adminHelpContentUnsaved = (unsaved: boolean): AdminHelpAction => {
    return {
        unsaved: unsaved,
        type: SAVE_ADMIN_HELP_CONTENT
    };
};