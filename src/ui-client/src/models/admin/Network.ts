/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

interface NetworkEndpointBase {
    id: number;
    name: string;
    address: string;
    issuer: string;
    keyId: string;
    certificate: string;
    isInterrogator: boolean;
    isResponder: boolean;
 }

 export interface NetworkEndpointDTO extends NetworkEndpointBase {
    created: string;
    updated: string;
 }

 export interface NetworkEndpoint extends NetworkEndpointBase {
    created: Date;
    updated: Date;
    changed?: boolean;
    unsaved?: boolean;
 }

 export interface Certificate {
    issuer: string;
    keyId: string;
    data: string;
 }