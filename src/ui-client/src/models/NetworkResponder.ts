/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export type NetworkResponderMap = Map<number, NetworkIdentity>;

export interface NetworkIdentityRespondersDTO {
    identity: NetworkIdentity;
    responders: NetworkResponderDTO[];
}

export interface NetworkResponderDTO {
    id: number;
    name: string;
    address: string;
}

export interface NetworkIdentity extends NetworkResponderDTO {
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

export interface NetworkResponder extends NetworkResponderDTO, NetworkIdentity {
    enabled: boolean;
}