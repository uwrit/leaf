/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppState } from '../../models/state/AppState';
import { showInfoModal, setNoClickModalState, setSideNotificationState, showConfirmationModal } from '../generalUi';
import { ConfirmationModalState, InformationModalState, NotificationStates } from "../../models/state/GeneralUiState";
import { AdminHelpPage, PartialAdminHelpPage, AdminHelpPageCategory, AdminHelpCategoryPageCache } from '../../models/admin/Help';
import { fetchPartialAdminHelpPages, fetchAdminHelpPageCategories, fetchAdminHelpPageContent,
         createAdminHelpPage, updateAdminHelpPage, deleteAdminHelpPage } from '../../services/admin/helpPagesApi';
import { AdminHelpPageLoadState } from '../../models/state/AdminState';

export const IS_ADMIN_HELP_PAGE_NEW = 'IS_ADMIN_HELP_PAGE_NEW';
export const IS_ADMIN_HELP_PAGE_UNSAVED = 'IS_ADMIN_HELP_PAGE_UNSAVED';
export const SET_ADMIN_HELP_PAGE = 'SET_ADMIN_HELP_PAGE';
export const SET_ADMIN_HELP_PAGE_LOAD_STATE = 'SET_ADMIN_HELP_PAGE_LOAD_STATE';
export const SET_ADMIN_HELP_CATEGORY_MAP = 'SET_ADMIN_HELP_CATEGORY_MAP';
export const SET_CURRENT_ADMIN_HELP_PAGE = 'SET_CURRENT_ADMIN_HELP_PAGE';

export interface AdminHelpPageAction {
    categories?: AdminHelpPageCategory[];
    currentPage?: AdminHelpPage;
    helpState?: AdminHelpPageLoadState;
    isNew?: boolean;
    page?: AdminHelpPage;
    partialPages?: PartialAdminHelpPage[];
    unsaved?: boolean;
    type: string;
}

// Asynchronous
/*
 * Get help pages and categories if it isn't loaded.
 */
export const loadAdminHelpPagesAndCategoriesIfNeeded = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        if (state.admin!.help.helpState === AdminHelpPageLoadState.NOT_LOADED) {
            try {
                dispatch(setNoClickModalState({ message: "Loading", state: NotificationStates.Working}));
                const categories = await fetchAdminHelpPageCategories(state);
                const partialPages = await fetchPartialAdminHelpPages(state);
                dispatch(setAdminHelpCategoryMap(categories as AdminHelpPageCategory[], partialPages as PartialAdminHelpPage[]));
                dispatch(setAdminHelpPageLoadState(AdminHelpPageLoadState.LOADED));
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
 * Get admin help page content.
 */
export const getAdminHelpPageContent = (p: PartialAdminHelpPage, category: AdminHelpCategoryPageCache) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            dispatch(setNoClickModalState({ message: "Loading Page", state: NotificationStates.Working }));
            const contentRows = await fetchAdminHelpPageContent(state, p.id);
            const page = {
                id: p.id,
                title: p.title,
                category: { id: category.id, name: category.name },
                content: contentRows,
                contentState: AdminHelpPageLoadState.LOADED
            } as AdminHelpPage;
            dispatch(setCurrentAdminHelpPage(page));
            dispatch(setAdminHelpPage(page));
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
export const createAdminHelpPageContent = (p: AdminHelpPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            dispatch(setNoClickModalState({ message: "Creating Page", state: NotificationStates.Working }));
            const created = await createAdminHelpPage(state, p);
            const page = {
                ...created,
                contentState: AdminHelpPageLoadState.LOADED
            } as AdminHelpPage;
            dispatch(setCurrentAdminHelpPage(page));
            dispatch(setAdminHelpPage(page));
            dispatch(reloadContent());
            dispatch(isAdminHelpPageNew(false));
            dispatch(isAdminHelpPageUnsaved(false));
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
export const updateAdminHelpPageContent = (p: AdminHelpPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));
            const updated = await updateAdminHelpPage(state, p);
            const page = {
                ...updated,
                contentState: AdminHelpPageLoadState.LOADED
            } as AdminHelpPage;
            dispatch(setCurrentAdminHelpPage(page));
            dispatch(setAdminHelpPage(page));
            dispatch(reloadContent());
            dispatch(isAdminHelpPageUnsaved(false));
            dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Page Updated' }));
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

export const deleteHelpPageAndContent = (pageId: string, title: string) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            // First reset admin content.
            dispatch(resetAdminHelpContent());
            await deleteAdminHelpPage(state, pageId);
            dispatch(reloadContent());
            const info: InformationModalState = {
                body: `"${title}" page deleted.`,
                header: "Delete Page",
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

export const reloadContent = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            const categories = await fetchAdminHelpPageCategories(state);
            const pages = await fetchPartialAdminHelpPages(state);
            dispatch(setAdminHelpCategoryMap(categories, pages));
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

export const resetAdminHelpContent = () => {
    return (dispatch: any) => {
        try {
            // Is content being created set to false.
            dispatch(isAdminHelpPageNew(false));
            // Content unsaved set to false
            dispatch(isAdminHelpPageUnsaved(false));
            // Set current admin help page to empty.
            dispatch(setCurrentAdminHelpPage({} as AdminHelpPage));
            // Set admin help page to empty.
            dispatch(setAdminHelpPage({} as AdminHelpPage));
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
export const setAdminHelpCategoryMap = (categories: AdminHelpPageCategory[], partialPages: PartialAdminHelpPage[]): AdminHelpPageAction => {
    return {
        categories: categories,
        partialPages: partialPages,
        type: SET_ADMIN_HELP_CATEGORY_MAP
    };
};

export const setAdminHelpPage = (page: AdminHelpPage): AdminHelpPageAction => {
    return {
        page: page,
        type: SET_ADMIN_HELP_PAGE
    };
};

export const setCurrentAdminHelpPage = (currentPage: AdminHelpPage): AdminHelpPageAction => {
    return {
        currentPage: currentPage,
        type: SET_CURRENT_ADMIN_HELP_PAGE
    };
};
 
export const setAdminHelpPageLoadState = (helpState: AdminHelpPageLoadState): AdminHelpPageAction => {
    return {
        helpState: helpState,
        type: SET_ADMIN_HELP_PAGE_LOAD_STATE
    };
};

export const isAdminHelpPageNew = (isNew: boolean): AdminHelpPageAction => {
    return {
        isNew: isNew,
        type: IS_ADMIN_HELP_PAGE_NEW
    };
};

export const isAdminHelpPageUnsaved = (unsaved: boolean): AdminHelpPageAction => {
    return {
        unsaved: unsaved,
        type: IS_ADMIN_HELP_PAGE_UNSAVED
    };
};