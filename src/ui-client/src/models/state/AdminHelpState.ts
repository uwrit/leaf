/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CreateHelpPage, UpdateHelpPageContent } from '../admin/Help';

export enum AdminHelpLoadState {
    NOT_LOADED = 1,
    LOADING = 2,
    LOADED = 3,
    ERROR = 4
}

export enum AdminHelpPane {
    PAGE = 1,
    CONTENT = 2
}

export interface AdminHelpContentState {
    changed: boolean;
    content?: UpdateHelpPageContent;
    // state: AdminHelpLoadState;
}

export interface AdminHelpPageState {
    changed: boolean;
    page?: CreateHelpPage;
    // state: AdminHelpLoadState;
}

export default interface AdminHelpState {
    activePane: AdminHelpPane;
    helpContent: AdminHelpContentState;
    helpPage: AdminHelpPageState;
}