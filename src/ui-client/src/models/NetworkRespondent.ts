/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export type NetworkRespondentMap = Map<number, NetworkIdentity>;

export interface NetworkIdentityRespondentsDTO {
    identity: NetworkIdentity;
    respondents: NetworkRespondentDTO[];
}

export interface NetworkRespondentDTO {
    id: number;
    name: string;
    address: string;
}

export interface NetworkIdentity extends NetworkRespondentDTO {
    abbreviation: string;
    description?: string;
    isHomeNode: boolean;
    totalPatients?: number;
    latitude: number;
    longitude: number;
    primaryColor: string;
    secondaryColor: string;
    enabled?: boolean;
}

export interface NetworkRespondent extends NetworkRespondentDTO, NetworkIdentity {
    enabled: boolean;
}