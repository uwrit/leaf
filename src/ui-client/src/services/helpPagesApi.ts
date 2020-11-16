/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { HelpPageContent } from '../models/Help/HelpPages';
import { HttpFactory } from './HttpFactory';

/*
 * Private general function for making requests.
 */
const makeRequest = async (state: AppState, requestString: string, requestParams?: object) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const request = requestParams
        ? http.get(requestString, requestParams)
        : http.get(requestString)
    return request;
};

/*
 * Fetch help pages.
 */
export const fetchHelpPages = (state: AppState) => {
    return makeRequest(state, 'api/help');
};

/*
 * Fetch help page content.
 */
export const fetchHelpPageContent = async (state: AppState, pageId: number) => {
    const content = await makeRequest(state, `api/help/${pageId.toString()}/content`);
    return content.data as HelpPageContent;
};