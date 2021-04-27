/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
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

export interface ConfigDTO {
    authentication: AuthenticationConfigDTO;
    attestation: AttestationOptionsDTO;
    cohort: CohortConfigDTO;
    client: ClientOptions;
    version: string;
}

interface AuthenticationConfigDTO {
    mechanism: AuthMechanismType;
    inactivityTimeoutMinutes: number;
    logoutUri: string;
}

interface AttestationOptionsDTO {
    enabled: boolean;
}

interface CohortConfigDTO {
    cacheLimit: number;
    exportLimit: number;
    deidentificationEnabled: boolean;
}

export interface AppConfig extends ConfigDTO { }

export interface ClientOptions {
    map: MapOptions;
    visualize: VisualizeOptions;
    timelines: TimelinesOptions;
    patientList: PatientListOptions;
    help: HelpOptions;
}

interface MapOptions {
    enabled: boolean;
    tileURI: string;
}

interface TimelinesOptions {
    enabled: boolean;
}

interface VisualizeOptions {
    enabled: boolean;
    showFederated?: boolean;
}

interface PatientListOptions {
    enabled: boolean;
}

interface HelpOptions {
    enabled: boolean;
    autoSend: boolean;
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
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string[];
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