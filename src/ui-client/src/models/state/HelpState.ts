/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { HelpPage, HelpPageContent, HelpPageCategory, HelpPageCategoryPair } from "../Help/HelpPages";

export enum HelpPageLoadState {
    NOT_LOADED = 1,
    LOADING = 2,
    LOADED = 3,
    ERROR = 4
}

export enum PairedState {
    NOT_PAIRED = 1,
    PAIRED = 2
}

export interface HelpPageContentState {
    content: HelpPageContent[];
    state: HelpPageLoadState;
}

export interface HelpPagesState {
    pages: HelpPage[];
    categories: HelpPageCategory[];
    content: HelpPageContentState;
    pairedPagesCategories: HelpPageCategoryPair[];
    paired: PairedState;
    state: HelpPageLoadState;
}