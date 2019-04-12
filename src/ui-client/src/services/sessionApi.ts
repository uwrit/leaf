/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import jwt_decode from 'jwt-decode';
import { AppState } from '../models/state/AppState';
import { AccessTokenDTO, Attestation, DecodedAccessToken, SessionContext, StoredSessionState } from '../models/Session';
import { HttpFactory } from './HttpFactory';
import { AuthConfig } from '../models/Auth';
import { getPanelItemCount } from '../utils/panelUtils';

/*
 * Decodes the session JWT to pull out server-sent
 * info on whether user is an admin, token lifespan, etc.
 */
const decodeToken = (token: string): SessionContext => {
    const decoded: DecodedAccessToken = jwt_decode(token);

    const ctx: SessionContext = {
        expirationDate: new Date(decoded.exp * 1000),
        issueDate: new Date(decoded.iat * 1000),
        rawDecoded: decoded,
        token
    }
    console.log('session', ctx);
    return ctx;
};

/*
 * Requests initial session token and submits user attestation.
 */
export const getSessionTokenAndContext = async (state: AppState, attestation: Attestation) => {
    return new Promise( async (resolve, reject) => {
        const http = HttpFactory.authenticated(state.auth.userContext!.token);
        const request = http.get('api/user/attest', {
            params: {
                attestation
            }
        });
        const response = await request;
        const respData = response.data as AccessTokenDTO;
        const ctx = decodeToken(respData.accessToken);
        resolve(ctx);
    });
};

/*
 * Requests, decodes, refreshes the current session token.
 */
export const refreshSessionTokenAndContext = (state: AppState) => {
    return new Promise( async (resolve, reject) => {
        try {
            const http = HttpFactory.authenticated(state.session.context!.token);
            const request = http.get('api/user/refresh');
            const response = await request;
            const respData = response.data as AccessTokenDTO;
            const ctx = decodeToken(respData.accessToken);
            resolve(ctx);
        } catch {
            saveSessionAndForceReLogin(state);
        }
    });
};

/*
 * Logs out the user, falling back to current URI if none configured.
 */
export const logout = (config: AuthConfig) => {
    if (config && config.logoutUri) {
        window.location = (config.logoutUri as any);
    }
    else {
        window.location = window.location;
    }
};

/*
 * Save current query state in sessionStorage and force
 * user to re-login to the current app URI.
 */
export const saveSessionAndForceReLogin = (state: AppState) => {
    const currState = getStoredSessionObject(state);
    const key = getSessionStorageKey(state);
    const hasData = getPanelItemCount(state.panels) > 0;
    
    if (hasData) {
        sessionStorage.setItem(key, JSON.stringify(currState));
    }
    window.location = window.location;
};

/*
 * Retrieve previously stored session object, if available.
 */
export const getPrevSession = (state: AppState) => {
    const key = getSessionStorageKey(state);
    const prev = sessionStorage.getItem(key);
    if (prev) { 
        const parsed = JSON.parse(prev) as StoredSessionState;
        for (const panel of parsed.panels) {
            if (panel.dateFilter.start.date) { panel.dateFilter.start.date = new Date(panel.dateFilter.start.date); }
            if (panel.dateFilter.end.date) { panel.dateFilter.end.date = new Date(panel.dateFilter.end.date); }
        }
        sessionStorage.removeItem(key);
        return parsed;
    }
    return;
};

/*
 * The browser can cache the Leaf page even if the IDP has timed out the
 * session token, whereby the initial login will appear to fail because the /config
 * initial call is not allowed by the IDP. Instead of confusing the user and forcing
 * her to refresh the browser, set a session storage key that signals it's okay to 
 * try a refresh once.
 */
export const attemptLoginRetryIfPossible = () => {
    const key = getSessionRetryKey();
    const retry = sessionStorage.getItem(key);
    if (!retry) {
        sessionStorage.setItem(key, 'X');
        window.location = window.location;
    } else {
        sessionStorage.removeItem(key);
    }
};

/*
 * Creates a session object to place in Session Storage
 * and allow the user to later reload most of app state if
 * they are logged out.
 */
const getStoredSessionObject = (state: AppState): StoredSessionState => {
    return { 
        queries: state.queries,
        panels: state.panels,
        panelFilters: state.panelFilters.filter((f) => f.isActive),
        timestamp: new Date().getTime() / 1000
    };
};

const getSessionStorageKey = (state: AppState) => `__leaf_session_v${state.auth.config!.version}__`;
const getSessionRetryKey = () => `__leaf_session_retry__`;