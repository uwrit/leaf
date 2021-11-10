/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { NetworkIdentityRespondersDTO, NetworkIdentityResponseDTO, RuntimeMode } from '../models/NetworkResponder';
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
    const response = resp.data as NetworkIdentityRespondersDTO;

    /*
     * Set homebase defaults;
     */
    response.identity.id = 0;
    response.identity.address = '';
    response.identity.isHomeNode = true;
    response.identity.enabled = true;
    response.identity.isGateway = response.identity.runtime === RuntimeMode.Gateway;
    return response;
};

/*
 * Request identity a given node.
 */
export const fetchResponderIdentity = async (state: AppState, resp: NetworkIdentityResponseDTO) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get(`${resp.address}/api/network/identity`);
};