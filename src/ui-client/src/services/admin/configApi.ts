/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from '../HttpFactory';
import { SqlConfiguration } from '../../models/admin/Configuration';

/*
 * Gets all current Concept SQLSets.
 */ 
export const getSqlConfiguration = async (state: AppState): Promise<SqlConfiguration> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/admin/config/sql');
    return resp.data as SqlConfiguration;
};
