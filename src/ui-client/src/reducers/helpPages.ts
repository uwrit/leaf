/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import {
    SET_HELP_PAGES,
    SET_HELP_PAGE,
} from '../actions/helpPages';
import { HelpPagesAction } from '../actions/helpPages';
import { HelpPagesState } from '../models/state/AppState';
import { HelpPages, HelpPageContent } from '../models/Help/HelpPages';

export const defaultHelpPagesState = (): HelpPagesState => {
    return {
        pages: [],
        pageContent: {
            id: 0,
            pageId: 0,
            orderId: 0,
            type: '',
            textContent: '',
            imageContent: new Uint16Array(),
            imageId: ''
        }
    }
};

const addHelpPages = (state: HelpPagesState, pages: HelpPages[]): HelpPagesState => {
    return Object.assign({}, state, {
        pages: pages
    });
};

const addHelpPage = (state: HelpPagesState, content: HelpPageContent): HelpPagesState => {
    return Object.assign({}, state, {
        pageContent: content
    });
};

export const helpPages = (state: HelpPagesState = defaultHelpPagesState(), action: HelpPagesAction): HelpPagesState => {
    switch (action.type) {
        case SET_HELP_PAGES:
            return addHelpPages(state, action.pages!);
        case SET_HELP_PAGE:
            return addHelpPage(state, action.pageContent!);
        default:
            return state;
    }
};