/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { HelpPages, HelpPageContent, HelpPageCategory } from "../Help/HelpPages";

export enum HelpPageLoadState {
    NOT_LOADED = 1,
    LOADING = 2,
    LOADED = 3,
    ERROR = 4
}

export interface HelpPageContentState {
    content: HelpPageContent[];
    state: HelpPageLoadState;
}

export interface HelpPagesState {
    pages: HelpPages[];
    pageCategory: HelpPageCategory[];
    pageContent: HelpPageContentState;
    state: HelpPageLoadState;
}