/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export enum AuthMechanismType {
    Unsecured = 0,
    ActiveDirectory = 1,
    Saml2 = 2
}

export interface AuthConfig {
    inactivityTimeoutMinutes: number;
    cacheLimit: number;
    clientOptions: ClientOptions;
    exportLimit: number;
    logoutUri: string;
    mechanism: AuthMechanismType;
    version: string;
}

export interface ClientOptions {
    map: MapOptions;
    help: HelpOptions;
}

interface MapOptions {
    enabled: boolean;
    tileURI: string;
}

interface HelpOptions {
    enabled: boolean;
    email?: string;
    uri?: string;
}

export interface IdTokenDTO {
    idToken: string;
}

export interface LogoutDTO {
    logoutURI: string;
}

export interface DecodedIdToken {
    'aud': string;
    'auth-type': string;
    'exp': number;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string[];
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
    'iat': number;
    'id-nonce': string;
    'iss': string;
    'leaf-version': string;
    'token-type': string;
}

export interface UserContext {
    expirationDate: Date;
    isAdmin: boolean;
    isFederatedOkay: boolean;
    isPhiOkay: boolean;
    isSuperUser: boolean;
    issuer: string;
    loginDate: Date;
    name: string;
    rawDecoded: DecodedIdToken;
    roles: string[];
    scope: string;
    token: string;
    version: string;
}

export interface IdTokenAndDates {
    expirationDate: Date;
    loginDate: Date;
    token: string;
}