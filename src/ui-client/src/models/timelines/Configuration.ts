/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ConceptId } from "../concept/Concept";
import { Panel } from "../panel/Panel";

export interface TimelinesDateConfiguration {
    increment: number;
    incrementType: DateIncrementType;
    mode: DateDisplayMode;
}

export interface TimelinesConfiguration {
    panels: Map<ConceptId, Panel>;
    dateIncrement: TimelinesDateConfiguration;
    indexPanel?: number;
    mode: TimelinesDisplayMode;
}

export enum TimelinesDisplayMode { PATIENT = 1, AGGREGATE = 2 }
export enum DateDisplayMode { BEFORE = 1, AFTER = 2, BEFORE_AND_AFTER = 3 }
export enum DateIncrementType { DAY = 1, HOUR = 2, MINUTE = 3, MONTH = 4, WEEK = 5, YEAR = 6 }