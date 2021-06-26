/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { defaultAdminState } from './admin';
import AdminState from '../../models/state/AdminState';
import { AdminHelpAction } from '../../actions/admin/helpPage';
import {
    SET_ADMIN_HELP_PANE,
    SET_ADMIN_HELP_CONTENT,
    CREATE_ADMIN_HELP_PAGE,
    UPDATE_ADMIN_HELP_CONTENT
} from '../../actions/admin/helpPage';

import { AdminHelpContent } from '../../models/admin/Help';
import { HelpPageLoadState } from '../../models/state/HelpState';

// export const createAdminHelpPage = (state: AdminState, action: AdminHelpAction): AdminState => {
//     return Object.assign({}, state, { 
//         helpPage: action.page
//     });
// };

// export const setAdminHelpContent = (state: AdminState, action: AdminHelpAction): AdminState => {
//     const contentRows = [...state.help.helpContent.content!, action.content];
//     const changed = true;

//     return Object.assign({}, state, {
//         content: contentRows,
//         changed: changed
//     });
// };

export const setAdminHelpContent = (state: AdminState, action: AdminHelpAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            page: action.content,
            state: action.contentLoadState
        }
    });
};

// export const setAdminHelpPane = (state: AdminState, action: AdminHelpAction): AdminState => {
//     return Object.assign({}, state, {
//         activePane: action.pane
//     });
// };

// export const adminHelp = (state: AdminState = defaultAdminState(), action: AdminHelpAction): AdminState => {
//     switch (action.type) {
//         case SET_ADMIN_HELP_PANE:
//             return setAdminHelpPane(state, action);
//         case SET_ADMIN_HELP_CONTENT:
//             return setAdminHelpContent(state, action);
//         case CREATE_ADMIN_HELP_PAGE:
//             return createAdminHelpPage(state, action);
//         case UPDATE_ADMIN_HELP_CONTENT:
//             console.log("THIS RAN AT LEAST")
//             return updateAdminHelpContent(state, action);
//         default:
//             return state;
//     };
// };