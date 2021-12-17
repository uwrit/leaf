/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { LeafUser, LeafUserDTO } from '../../models/admin/LeafUser';

/*
 * Search users by term.
 */ 
export const searchUsersByTerm = async (state: AppState, name: string): Promise<LeafUser[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/user/search', {
        params: {
            name
        }
    });
    const users = resp.data as LeafUserDTO[];
    return users.map(u => {
        const nameParts = u.scopedIdentity.split('@');
        return {
            ...u,
            name: nameParts[0],
            scope: nameParts[1],
            created: new Date(u.created),
            updated: new Date(u.updated)
    }});
};