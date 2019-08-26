/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import Axios from 'axios';
import jwt_decode from 'jwt-decode';
import { AppConfig, DecodedIdToken, IdTokenDTO, UserContext } from '../models/Auth';

/*
 * Return the id token key to look for
 * to retrieve a user token.
 */
const getIdTokenKey = (config: AppConfig) => {
    return `__leaf_idToken_v${config.version}__`;
};

/*
 * Return the id token key to look for
 * to retrieve a user token.
 */
const decodeToken = (token: string): UserContext => {
    const decoded = jwt_decode(token) as DecodedIdToken;
    const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const fullname = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    const nameSplit = fullname.split('@');
    let name = fullname;
    let scope = '';

    if (nameSplit.length === 2) {
        name = nameSplit[0];
        scope = nameSplit[1];
    }
    
    const ctx: UserContext = {
        expirationDate: new Date(decoded.exp * 1000),
        isAdmin: roles.indexOf('admin') > -1,
        isFederatedOkay: roles.indexOf('fed') > -1,
        isPhiOkay: roles.indexOf('phi') > -1,
        isSuperUser: roles.indexOf('super') > -1,
        issuer: decoded.iss,
        loginDate: new Date(decoded.iat * 1000),
        name,
        rawDecoded: decoded,
        roles,
        scope,
        token,
        version: decoded['leaf-version']
    }
    console.info(`Leaf server API running version ${ctx.version}`);
    console.log('User Token', ctx);
    return ctx;
};

/*
 * Delete the current IdToken from LocalStorage.
 */
export const clearCurrentUserToken = (config: AppConfig) => {
    window.localStorage.clear();
};

/*
 * Return the id token key to look for
 * to retrieve a user token.
 */
export const getUserTokenAndContext = async (config: AppConfig): Promise<UserContext> => {
    return new Promise( async (resolve, reject) => {
        const idTokenKey = getIdTokenKey(config);
        let token;
        let ctx;
        
        // Try to get from local storage
        token = window.localStorage.getItem(idTokenKey)!;
        if (token) {
            ctx = decodeToken(token);

            // If the date time is greater than now, use current
            if (ctx.expirationDate > new Date()) {
                return resolve(ctx);
            }
        }

        // Else phone home for a new one
        Axios.get('/api/user')
            .then(response => {
                const respData: IdTokenDTO = response.data;
                ctx = decodeToken(respData.idToken);

                // Add to local storage and return to caller
                window.localStorage.setItem(idTokenKey, ctx.token);
                resolve(ctx);
            })
            .catch(err => {
                reject(err);
            });
    });
};

/*
 * Return the configuration for this Leaf instance.
 */
export const getAuthConfig = async () => {
    const request = await Axios.get('/api/config');
    const config = request.data as AppConfig;
    return config;
};

