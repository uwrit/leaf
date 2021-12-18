/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import jwt_decode from 'jwt-decode';
import { AppState } from '../models/state/AppState';
import { AccessTokenDTO, Attestation, DecodedAccessToken, SessionContext } from '../models/Session';
import { HttpFactory } from './HttpFactory';
import { LogoutDTO } from '../models/Auth';

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
    console.log('Session Token', ctx);
    return ctx;
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
            // 
        }
    });
};

/*
 * Requests initial session token and submits user attestation.
 */
export const getSessionTokenAndContext = async (state: AppState, attestation: Attestation) => {
    const http = HttpFactory.authenticated(state.auth.userContext!.token);

    const request = http.get('api/user/attest', {
        params: {
            'documentation.expirationDate': attestation.documentation.expirationDate,
            'documentation.institution': attestation.documentation.institution,
            'documentation.title': attestation.documentation.title,
            ...attestation
        }
    });

    const response = await request;
    const respData = response.data as AccessTokenDTO;
    const ctx = decodeToken(respData.accessToken);
    return ctx;
};

/*
 * Tells the server to blacklist this token, as the uses is logging out.
 */
export const logoutFromServer = async (state: AppState): Promise<LogoutDTO | undefined> => {
    try {
        const http = HttpFactory.authenticated(state.auth.userContext!.token);
        const request = await http.post('api/user/logout');
        return request.data as LogoutDTO;
    } catch (err) {
        console.log(err);
    }
    return;
};

/*
 * The session retry key is used to allow Leaf to forcefully restart 
 * the browser session if login fails (thus being intercepted by the SP and re-authenticating the user) 
 * without getting stuck in an endless refresh loop should the 2nd authentication attempt fail. (See attemptLoginRetryIfPossible() above)
 * After a successful authentication though, the retry key can be cleared with this function to ensure the 
 * browser will continue to attempt future re-authentication cycles if
 * the previous attempt in this browser tab succeeded.
 */
export const removeSessionRetryKey = (): void => {
    const key = getSessionRetryKey();
    sessionStorage.removeItem(key);
}

const getSessionRetryKey = () => `__leaf_dashboard_session_retry__`;