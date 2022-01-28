/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { PartialAdminHelpPageDTO, AdminHelpPageCategoryDTO, AdminHelpPageContentDTO,
        AdminHelpPage, AdminHelpPageDTO } from '../../models/admin/Help';
import { HttpFactory } from '../HttpFactory';

/*
 * Gets help pages.
 */
export const fetchPartialAdminHelpPages = async (state: AppState): Promise<PartialAdminHelpPageDTO[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/helppages`);
    return resp.data as PartialAdminHelpPageDTO[];
};

/*
 * Gets help page categories.
 */
export const fetchAdminHelpPageCategories = async (state: AppState): Promise<AdminHelpPageCategoryDTO[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/helppages/categories`);
    return resp.data as AdminHelpPageCategoryDTO[];
};

/*
 * Gets help page content.
 */
export const fetchAdminHelpPageContent = async (state: AppState, pageId: string): Promise<AdminHelpPageContentDTO[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/helppages/${pageId}/content`);
    return resp.data as AdminHelpPageContentDTO[];
};

/*
 * Creates help page and content, and category if it doesn't exist.
 */
export const createAdminHelpPage = async (state: AppState, p: AdminHelpPage): Promise<AdminHelpPageDTO> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    p.content.forEach(c => c.id = ''); // Set content row id to empty b/c shortId is not a Guid.
    const page = { id: p.id, title: p.title, category: p.category, content: p.content } as AdminHelpPageDTO;
    const resp = await http.post('api/admin/helppages', page);
    return resp.data as AdminHelpPageDTO;
};

/*
 * Updates help page, category, and content.
 */
export const updateAdminHelpPage = async (state: AppState, p: AdminHelpPage): Promise<AdminHelpPageDTO> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    p.content.forEach(c => c.id = ''); // Set content row id to empty b/c shortId is not a Guid.
    const page = { id: p.id, title: p.title, category: p.category, content: p.content } as AdminHelpPageDTO;
    const resp = await http.put(`api/admin/helppages/${p.id}`, page);
    return resp.data as AdminHelpPageDTO;
};

/*
 * Deletes help page and content, and category if no pages under category.
 */
export const deleteAdminHelpPage = async (state: AppState, pageId: string): Promise<AdminHelpPageDTO> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.delete(`api/admin/helppages/${pageId}`);
    return resp.data as AdminHelpPageDTO;
};