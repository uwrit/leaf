/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { AdminHelpPageDTO, AdminHelpPageCategoryDTO, AdminHelpPageContentDTO, AdminHelpPageAndContentDTO } from '../../models/admin/Help';
import { HttpFactory } from '../HttpFactory';

/*
 * Gets help pages.
 */
export const fetchAdminHelpPages = async (state: AppState) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/helppages`);
    return resp.data as AdminHelpPageDTO[];
};

/*
 * Gets help page categories.
 */
export const fetchAdminHelpPageCategories = async (state: AppState) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/helppages/categories`);
    return resp.data as AdminHelpPageCategoryDTO[];
};

/*
 * Gets help page content.
 */
export const fetchAdminHelpPageContent = async (state: AppState, pageId: string) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/helppages/${pageId}/content`);
    return resp.data as AdminHelpPageContentDTO[];
};

/*
 * Creates help page and content, and category if it doesn't exist.
 */
export const createAdminHelpPage = async (state: AppState, pageAndContent: AdminHelpPageAndContentDTO) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post('api/admin/helppages', pageAndContent);
    return resp.data as AdminHelpPageAndContentDTO;
};

/*
 * Updates help page, category, and content.
 */
export const updateAdminHelpPage = async (state: AppState, pageId: string, pageAndContent: AdminHelpPageAndContentDTO) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/helppages/${pageId}`, pageAndContent);
    return resp.data as AdminHelpPageAndContentDTO;
};

/*
 * Deletes help page and content, and category if no pages under category.
 */
export const deleteAdminHelpPage = async (state: AppState, pageId: string) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.delete(`api/admin/helppages/${pageId}`);
    return resp.data as AdminHelpPageAndContentDTO;
};