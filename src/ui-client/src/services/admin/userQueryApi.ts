/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { LeafUser, LeafUserDTO } from '../../models/admin/LeafUser';
import { SavedQueryRef } from '../../models/Query';

/*
 * Search users by term.
 */ 
export const searchUsersByTerm = async (state: AppState, term: string): Promise<LeafUser[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/query/searchusers', {
        params: {
            term
        }
    });
    const users = resp.data as LeafUserDTO[];
    return users.map(u => ({
       ...u,
       created: new Date(u.created),
       updated: new Date(u.updated)
    }));
};

/*
 * Get all saved queries refs for a given user.
 */ 
export const getQueriesByUser = async (state: AppState, user: LeafUser): Promise<SavedQueryRef[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/query/${user.fullIdentity}`);
    return resp.data as SavedQueryRef[];
};
