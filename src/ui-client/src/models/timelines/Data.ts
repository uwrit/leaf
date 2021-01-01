/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Concept, ConceptId } from "../concept/Concept";

export type TimePointId = string;

export interface TimelinesAggregateDataset {
    concepts: Map<ConceptId, TimelinesAggregateConcept>;
}

export interface TimelinesAggregateConcept {
    concept: Concept;
    data: TimelinesAggregateDataRow[];
}

export interface TimelinesAggregateDataRow {
    conceptId: ConceptId;
    timepointId: TimePointId;
    displayValueX: number;
    displayValueY: number;
    values: TimelinesAggregateDataRowValue;
}

export interface TimelinesAggregateDataRowValue {
    percent: number;
    size: 0 | 1 | 2 | 3 | 4 | 5;
    total: number;
}

export interface TimelinesAggregateTimeBin {
    label: string;
    minNum?: number;
    maxNum?: number;
}

export interface TimelinesPatientDataRow {
     
}