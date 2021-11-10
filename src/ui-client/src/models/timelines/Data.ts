/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ConceptId } from "../concept/Concept";
import { Panel } from "../panel/Panel";

export type TimePointId = string;

export interface TimelinesAggregateDataset {
    concepts: Map<ConceptId, TimelinesAggregateConcept>;
}

export interface TimelinesAggregateConcept {
    panel: Panel;
    data: TimelinesAggregateDataRow[];
}

export interface TimelinesAggregateDataRow {
    conceptId: ConceptId;
    isIndex?: boolean;
    timepointId: TimePointId;
    displayValueX: number;
    displayValueY: number;
    displayValues: number[];
    values: TimelinesAggregateDataRowValue;
}

export interface TimelinesAggregateDataRowValue {
    percent: number;
    total: number;
}

export interface TimelinesAggregateTimeBin {
    isIndex?: boolean;
    label: string;
    minNum?: number;
    maxNum?: number;
}

export interface TimelinesPatientDataRow {
     
}