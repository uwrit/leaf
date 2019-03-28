/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export interface ConceptHintDTO {
    conceptId: string;
    tokens: string[];
}

export interface ConceptEquivalentHint {
    targetCode: string;
    targetCodeType: string;
    uiDisplayTargetName: string;
}

export interface ConceptHintRefGroup {
    text: string;
    refs: ConceptHintRef[];
}

export interface ConceptHintRef {
    id: string;
    text: string;
    tokens: string[];
}

export interface MatchedConceptHintRef {
    matchedTerms: string;
    remainingTerms: Set<string>;
    ref: ConceptHintRef;
}

export interface AggregateConceptHintRef {
    ids: string[];
    fullText: string;
    text: string;
    suggestion: string;
}

export type RootId = string;
export type HintId = string;
export type Token = string;
export type FirstChar = string;