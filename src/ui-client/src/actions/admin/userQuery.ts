/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { LeafUser } from "../../models/admin/LeafUser";
import { SavedQueryRef } from "../../models/Query";
import { searchUsersByTerm } from "../../services/admin/userApi";
import { getQueriesByUser } from "../../services/admin/queryApi";

export const SET_ADMIN_QUERY_USERS = 'SET_ADMIN_QUERY_USERS';
export const SET_ADMIN_QUERIES = 'SET_ADMIN_QUERIES';
export const SET_ADMIN_QUERY_FETCHING_USERS = 'SET_ADMIN_QUERY_FETCHING_USERS';
export const SET_ADMIN_QUERY_FETCHING_QUERIES = 'SET_ADMIN_QUERY_FETCHING_QUERIES';
export const SET_ADMIN_QUERY_USER_SEARCH_TERM = 'SET_ADMIN_QUERY_USER_SEARCH_TERM';

export interface AdminQueryAction {
    queries?: SavedQueryRef[];
    term?: string;
    users?: LeafUser[];
    type: string;
}

// Asynchronous
/*
 * Fetch users by search term.
 */
export const searchAdminQueryUsers = (term: string) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const users = await searchUsersByTerm(state, term) as LeafUser[];
        dispatch(setAdminQueryUsers(users));
    };
};

/*
 * Fetch all queries for a user.
 */
export const searchAdminQueriesByUser = (user: LeafUser) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const queries = await getQueriesByUser(state, user) as SavedQueryRef[];
        dispatch(setAdminUserQueries(queries));
    };
};

// Synchronous
export const setAdminQueryUsers = (users: LeafUser[]) => {
    return {
        users,
        type: SET_ADMIN_QUERY_USERS
    };
};

export const setAdminUserQueries = (queries: SavedQueryRef[]) => {
    return {
        queries,
        type: SET_ADMIN_QUERIES
    };
};

export const setAdminUserSearchTerm = (term: string) => {
    return {
        term,
        type: SET_ADMIN_QUERY_USER_SEARCH_TERM
    };
};

export const setAdminQueryFetchingUsers = () => {
    return {
        type: SET_ADMIN_QUERY_FETCHING_USERS
    };
};

export const setAdminQueryFetchingQueries = () => {
    return {
        type: SET_ADMIN_QUERY_FETCHING_QUERIES
    };
};