/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { LeafUser } from '../../models/admin/LeafUser';
import { SavedQueryRef, SavedQueryRefDTO } from '../../models/Query';

/*
 * Get all saved queries refs for a given user.
 */ 
export const getQueriesByUser = async (state: AppState, user: LeafUser): Promise<SavedQueryRef[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/query/${user.fullIdentity}`);
    const dtos = resp.data as SavedQueryRefDTO[];
    return dtos.map(dto => {
        const ownerParts = dto.owner.split('@');
        return {
            ...dto,
            ownerShort: ownerParts[0],
            ownerScope: ownerParts[1],
            created: new Date(dto.created),
            updated: new Date(dto.updated)
        };
    })
};
