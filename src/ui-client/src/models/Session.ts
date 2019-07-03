/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { DecodedIdToken } from './Auth'
import { SavedQueriesState } from './Query';
import { Panel } from './panel/Panel';
import { PanelFilter } from './panel/PanelFilter';

export enum SessionType {
    QualityImprovement = 1,
    Research = 2
}

export interface DocumentationApproval {
    expirationDate?: Date;
    institution: string;
    title: string;
}

export interface SessionState {
    attestation?: Attestation;
    context?: SessionContext;
    error?: boolean;
    hasAttested: boolean;
    isSubmittingAttestation: boolean;
    loadingDisplay: string;
    loadingProgressPercent: number;
}

export interface Attestation {
    documentation: DocumentationApproval;
    isIdentified: boolean;
    nonce?: string;
    sessionType: SessionType;
}

export interface AccessTokenDTO {
    accessToken: string;
}

export interface DecodedAccessToken extends DecodedIdToken {
    'access-nonce': string;
    'data-class': string;
    'session-type': number;
}

export interface SessionContext {
    expirationDate: Date;
    issueDate: Date;
    rawDecoded: DecodedAccessToken;
    token: string;
}

export interface StoredSessionState {
    queries: SavedQueriesState;
    panels: Panel[];
    panelFilters: PanelFilter[];
    timestamp: number;
}