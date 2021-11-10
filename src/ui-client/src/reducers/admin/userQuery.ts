/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminQueryAction } from "../../actions/admin/userQuery";

export const SET_ADMIN_QUERY_USERS = 'SET_ADMIN_QUERY_USERS';
export const SET_ADMIN_QUERIES = 'SET_ADMIN_QUERIES';
export const SET_ADMIN_QUERY_USER_SEARCH_TERM = 'SET_ADMIN_QUERY_USER_SEARCH_TERM';

export const setAdminQueryUsers = (state: AdminState, action: AdminQueryAction): AdminState => {
    return Object.assign({}, state, { 
        userQueries: {
            ...state.userQueries,
            fetchingUsers: false,
            queries: [],
            users: action.users!
        }
    });
};

export const setAdminUserQueries = (state: AdminState, action: AdminQueryAction): AdminState => {
    return Object.assign({}, state, { 
        userQueries: {
            ...state.userQueries,
            fetchingQueries: false,
            queries: action.queries
        }
    });
};

export const setAdminUserFetchingUsers = (state: AdminState, action: AdminQueryAction): AdminState => {
    return Object.assign({}, state, { 
        userQueries: {
            ...state.userQueries,
            fetchingUsers: true
        }
    });
};

export const setAdminUserFetchingQueries = (state: AdminState, action: AdminQueryAction): AdminState => {
    return Object.assign({}, state, { 
        userQueries: {
            ...state.userQueries,
            fetchingQueries: true
        }
    });
};

export const setAdminQuerySearchTerm = (state: AdminState, action: AdminQueryAction): AdminState => {
    return Object.assign({}, state, { 
        userQueries: {
            ...state.userQueries,
            searchTerm: action.term,
            queries: [],
            users: action.term!.length ? state.userQueries.users : []
        }
    });
};
