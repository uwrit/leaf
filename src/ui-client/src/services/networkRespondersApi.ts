/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { NetworkIdentityRespondersDTO, NetworkResponderDTO } from '../models/NetworkResponder';
import { HttpFactory } from './HttpFactory';

/*
 * Request identity of the home node (identity is
 * composed of basic information about the database this
 * node represents, mostly for display to user.)
 */
export const fetchHomeIdentityAndResponders = async (state: AppState) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/network/responders');
    return resp.data as NetworkIdentityRespondersDTO;
};

/*
 * Request identity a given node.
 */
export const fetchResponderIdentity = async (state: AppState, resp: NetworkResponderDTO) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get(`${resp.address}/api/network/identity`);
};