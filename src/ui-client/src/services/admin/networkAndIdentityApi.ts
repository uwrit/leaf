/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { NetworkEndpoint, Certificate } from "../../models/admin/Network";
import { HttpFactory } from "../HttpFactory";
import { NetworkIdentity } from "../../models/NetworkResponder";

/*
 * Get all current network endpoints with admin metadata.
 */
export const getNetworkEndpoints = async (state: AppState): Promise<NetworkEndpoint[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get(`api/admin/network/endpoint`);
    return resp.data;
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