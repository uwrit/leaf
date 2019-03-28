/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { NetworkIdentityRespondentsDTO, NetworkRespondentDTO } from '../models/NetworkRespondent';
import { HttpFactory } from './HttpFactory';

/*
 * Request identity of the home node (identity is
 * composed of basic information about the database this
 * node represents, mostly for display to user.)
 */
export const fetchHomeIdentityAndRespondents = async (state: AppState) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/network/respondents');
    return resp.data as NetworkIdentityRespondentsDTO;
};

/*
 * Request identity a given node.
 */
export const fetchRespondentIdentity = async (state: AppState, resp: NetworkRespondentDTO) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get(`${resp.address}/api/network/identity`);
};