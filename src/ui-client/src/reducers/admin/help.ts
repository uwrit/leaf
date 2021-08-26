/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import AdminState from '../../models/state/AdminState';
import { AdminHelpAction } from '../../actions/admin/helpPage';

export const adminHelpContentUnsaved = (state: AdminState, action: AdminHelpAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            unsaved: action.unsaved
        }
    });
};

export const isAdminHelpContentNew = (state: AdminState, action: AdminHelpAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            createNew: action.createNew
        }
    });
};

export const setCurrentAdminHelpContent = (state: AdminState, action: AdminHelpAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            currentContent: action.currentContent
        }
    });
};

export const setAdminHelpContent = (state: AdminState, action: AdminHelpAction): AdminState => {
    return Object.assign({}, state, {
        help: {
            ...state.help,
            content: action.content,
            state: action.contentLoadState
        }
    });
};