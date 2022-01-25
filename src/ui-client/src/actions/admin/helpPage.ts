/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppState } from '../../models/state/AppState';
import { showInfoModal, setNoClickModalState, setSideNotificationState, showConfirmationModal } from '../generalUi';
import { ConfirmationModalState, InformationModalState, NotificationStates } from "../../models/state/GeneralUiState";
import { AdminHelpPage, AdminHelpPageDTO, AdminHelpPageCategoryDTO, AdminHelpPageCategoryExt, AdminHelpPageAndContent } from '../../models/admin/Help';
import { fetchAdminHelpPages, fetchAdminHelpPageCategories, fetchAdminHelpPageContent,
         createAdminHelpPage, updateAdminHelpPage, deleteAdminHelpPage } from '../../services/admin/helpPagesApi';
import { AdminHelpPageLoadState } from '../../models/state/AdminState';

export const SET_ADMIN_HELP_PAGES_AND_CATEGORIES = 'SET_ADMIN_HELP_PAGES_AND_CATEGORIES';
export const SET_ADMIN_HELP_PAGE_AND_CONTENT = 'SET_ADMIN_HELP_PAGE_AND_CONTENT';
export const SET_CURRENT_ADMIN_HELP_PAGE_AND_CONTENT = 'SET_CURRENT_ADMIN_HELP_PAGE_AND_CONTENT';
export const SET_CURRENT_SELECTED_ADMIN_HELP_PAGE = 'SET_CURRENT_SELECTED_ADMIN_HELP_PAGE';
export const SET_ADMIN_HELP_PAGE_LOAD_STATE = 'SET_ADMIN_HELP_PAGE_LOAD_STATE';
export const IS_ADMIN_HELP_PAGE_NEW = 'IS_ADMIN_HELP_PAGE_NEW';
export const IS_ADMIN_HELP_PAGE_UNSAVED = 'IS_ADMIN_HELP_PAGE_UNSAVED';

export interface AdminHelpPageAction {
    categories?: AdminHelpPageCategoryDTO[];
    currentContent?: AdminHelpPageAndContent,
    currentSelectedPage?: AdminHelpPage,
    pages?: AdminHelpPageDTO[];
    helpState?: AdminHelpPageLoadState;
    isNew?: boolean;
    unsaved?: boolean;
    type: string;
}

export interface AdminHelpPageContentAction {
    page?: AdminHelpPageAndContent;
    contentState?: AdminHelpPageLoadState;
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
                const pages = await fetchAdminHelpPages(state);
                
                dispatch(setAdminHelpPagesAndCategories(categories, pages));
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
export const getAdminHelpPageContent = (page: AdminHelpPage, category: AdminHelpPageCategoryExt) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            dispatch(setNoClickModalState({ message: "Loading Page", state: NotificationStates.Working }));

            dispatch(setCurrentSelectedAdminHelpPage(page));

            const contentRows = await fetchAdminHelpPageContent(state, page.id);

            const pageAndContent = { title: page.title, category: { id: category.id, name: category.name }, content: contentRows } as AdminHelpPageAndContent;
            dispatch(setCurrentAdminHelpPageAndContent(pageAndContent));
            dispatch(setAdminHelpPageAndContent(pageAndContent, AdminHelpPageLoadState.LOADED));

            // dispatch(isAdminHelpPageUnsaved(false));

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
export const createAdminHelpPageContent = (pageAndContent: AdminHelpPageAndContent) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            dispatch(setNoClickModalState({ message: "Creating Page", state: NotificationStates.Working }));
            
            // Create help page.
            const created = await createAdminHelpPage(state, pageAndContent);

            dispatch(setCurrentAdminHelpPageAndContent(created));
            dispatch(setAdminHelpPageAndContent(created, AdminHelpPageLoadState.LOADED));

            const pageId = created.content[0].pageId;
            dispatch(reloadContent(pageId));

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
export const updateAdminHelpPageContent = (pageId: string, pageAndContent: AdminHelpPageAndContent) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));

            const updated = await updateAdminHelpPage(state, pageId, pageAndContent);

            dispatch(setCurrentAdminHelpPageAndContent(updated));
            dispatch(setAdminHelpPageAndContent(updated, AdminHelpPageLoadState.LOADED));
            
            
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

export const deleteHelpPageAndContent = (page: AdminHelpPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            // First reset admin content.
            dispatch(resetAdminHelpContent());

            // Delete help page.
            
            // TODO
            // const deleted = await deleteAdminHelpPage(state, page.id);
            await deleteAdminHelpPage(state, page.id);
            
            // Fetch updated categories and pages after page delete.
            const categories = await fetchAdminHelpPageCategories(state);
            const pages = await fetchAdminHelpPages(state);
            
            // Set new categories and pages.
            dispatch(setAdminHelpPagesAndCategories(categories, pages));
        
            const info: InformationModalState = {
                body: `"${page.title}" page deleted.`,
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

export const reloadContent = (pageId?: string) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {
            const categories = await fetchAdminHelpPageCategories(state);
            const pages = await fetchAdminHelpPages(state);
            
            dispatch(setAdminHelpPagesAndCategories(categories, pages));

            if (pageId) {
                const page = pages.find(p => p.id === pageId)!;
                dispatch(setCurrentSelectedAdminHelpPage(page));
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

export const resetAdminHelpContent = () => {
    return (dispatch: any) => {
        try {
            // Is content being created set to false.
            dispatch(isAdminHelpPageNew(false));

            // Content unsaved set to false
            dispatch(isAdminHelpPageUnsaved(false));

            // Set current help page to empty.
            dispatch(setCurrentSelectedAdminHelpPage({} as AdminHelpPage));

            // Set current admin help content to empty.
            dispatch(setCurrentAdminHelpPageAndContent({} as AdminHelpPageAndContent));

            // Set admin help content to empty and load state to NOT_LOADED.
            dispatch(setAdminHelpPageAndContent({} as AdminHelpPageAndContent, AdminHelpPageLoadState.NOT_LOADED));
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
export const setAdminHelpPagesAndCategories = (categories: AdminHelpPageCategoryDTO[], pages: AdminHelpPageDTO[]): AdminHelpPageAction => {
    return {
        categories: categories,
        pages: pages,
        type: SET_ADMIN_HELP_PAGES_AND_CATEGORIES
    };
};

export const setAdminHelpPageAndContent = (page: AdminHelpPageAndContent, contentState: AdminHelpPageLoadState): AdminHelpPageContentAction => {
    return {
        page: page,
        contentState: contentState,
        type: SET_ADMIN_HELP_PAGE_AND_CONTENT
    };
};

export const setCurrentAdminHelpPageAndContent = (currentContent: AdminHelpPageAndContent): AdminHelpPageAction => {
    return {
        currentContent: currentContent,
        type: SET_CURRENT_ADMIN_HELP_PAGE_AND_CONTENT
    };
};

export const setCurrentSelectedAdminHelpPage = (currentPage: AdminHelpPage): AdminHelpPageAction => {
    return {
        currentSelectedPage: currentPage,
        type: SET_CURRENT_SELECTED_ADMIN_HELP_PAGE
    };
};
 
export const setAdminHelpPageLoadState = (loadState: AdminHelpPageLoadState): AdminHelpPageAction => {
    return {
        helpState: loadState,
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