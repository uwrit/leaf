/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export interface PatientCountDTO {
    queryId: string;
    preflight: PreflightCheckDTO;
    result: PatientCountResultDTO;
}

export interface PatientCountResultDTO {
    plusMinus: number;
    sqlStatements: string[];
    value: number;
    withinLowCellThreshold: boolean;
}

export interface PreflightCheckDTO {
    conceptPreflight: ConceptPreflightCheckDTO;
    queryPreflight: QueryPreflightCheckDTO;
}

export interface ConceptPreflightCheckDTO {
    ok: boolean;
    results: ConceptPreflightCheckResultDTO[];
}

export interface ConceptPreflightCheckResultDTO {
    id: number;
    universalId: string;
    isPresent: boolean;
    isAuthorized: boolean;
}

export interface QueryPreflightCheckDTO {
    ok: boolean;
    results: QueryPreflightCheckResultDTO[];
}

export interface QueryPreflightCheckResultDTO {
    id: string;
    universalId: string;
    ver: number;
    isPresent: boolean;
    isAuthorized: boolean;
    conceptPreflight: ConceptPreflightCheckDTO;
}