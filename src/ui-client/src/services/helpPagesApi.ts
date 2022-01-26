/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { HelpPageContentDTO, HelpPageDTO, HelpPageCategoryDTO } from '../models/help/Help';
import { HttpFactory } from './HttpFactory';

/*
 * Private general function for making requests.
 */
const makeRequest = async (state: AppState, requestString: string) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const request = http.get(requestString)
    return request;
};

/*
 * Fetch help pages.
 */
export const fetchHelpPages = async (state: AppState) => {
    const pages = await makeRequest(state, 'api/helppages');
    return pages.data as HelpPageDTO[];
};

/*
 * Fetch help page categories.
 */
export const fetchHelpPageCategories = async (state: AppState) => {
    const cats = await makeRequest(state, 'api/helppages/categories');
    return cats.data as HelpPageCategoryDTO[];
};

/*
 * Fetch help page content.
 */
export const fetchHelpPageContent = async (state: AppState, pageId: string) => {
    const content = await makeRequest(state, `api/helppages/${pageId}/content`);
    return content.data as HelpPageContentDTO[];
};