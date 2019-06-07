/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { fetchHomeIdentityAndResponders } from "../networkRespondersApi";
import { NetworkEndpoint, Certificate } from "../../models/admin/Network";
import { HttpFactory } from "../HttpFactory";
import { NetworkIdentity } from "../../models/NetworkResponder";

/*
 * Get all current network endpoints with admin metadata.
 */
export const getNetworkEndpoints = async (state: AppState): Promise<NetworkEndpoint[]> => {
    const endpoints: NetworkEndpoint[] = [];

    /* Use for testing only, replace when API call available */
    const resp = await fetchHomeIdentityAndResponders(state);

    for (const responder of resp.responders) {
        const cert = await getCertificate(state, responder.address);
        const endpoint: NetworkEndpoint = {
            ...responder,
            keyId: cert.keyId,
            issuer: cert.issuer,
            certificate: cert.data,
            updated: new Date(),
            created: new Date(),
            isInterrogator: true,
            isResponder: true
        };
        endpoints.push(endpoint);
    }

    const cert = await getCertificate(state, '');
    const test: NetworkEndpoint = {
        address: '',
        id: 0,
        name: 'test',
        keyId: cert.keyId,
        issuer: cert.issuer,
        certificate: cert.data,
        updated: new Date(),
        created: new Date(),
        isInterrogator: true,
        isResponder: true
    };
    endpoints.push(test);

    return endpoints;
};

/*
 * Upsert identity.
 */
export const upsertIdentity = async (state: AppState, identity: NetworkIdentity): Promise<NetworkIdentity> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/network`, identity);
    return resp.data;
};

/*
 * Create an endpoint.
 */
export const createEndpoint = async (state: AppState, endpoint: NetworkEndpoint): Promise<NetworkEndpoint> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.post(`api/admin/network/endpoint`, endpoint);
    return resp.data;
};

/*
 * Update an endpoint.
 */
export const updateEndpoint = async (state: AppState, endpoint: NetworkEndpoint): Promise<NetworkEndpoint> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.put(`api/admin/network/endpoint/${endpoint.id}`, endpoint);
    return resp.data;
};

/*
 * Delete an endpoint.
 */
export const deleteEndpoint = async (state: AppState, endpoint: NetworkEndpoint): Promise<NetworkEndpoint> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.delete(`api/admin/network/endpoint/${endpoint.id}`);
    return resp.data;
};

/* 
 * Get certificate for a given endpoint.
 */
export const getCertificate = async (state: AppState, address: string): Promise<Certificate> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`${address}/api/network/certificate`);
    return resp.data;
};