/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

interface BaseLeafUser {
    id: string;
    scopedIdentity: string;
    fullIdentity: string;
    savedQueryCount: number;
}

export interface LeafUser extends BaseLeafUser {
    name: string;
    scope: string;
    created: Date;
    updated: Date;
}

export interface LeafUserDTO extends BaseLeafUser {
    created: string;
    updated: string;
}