/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CancelTokenSource } from 'axios';
import { BaseDatasetViewConfigurationConfiguration, PatientListConfiguration } from '../patientList/Configuration';
import { PatientListRow } from '../patientList/Patient';
import { DemographicStatistics } from '../cohort/DemographicDTO';
import { TimelinesConfiguration } from '../timelines/Configuration';
import { TimelinesAggregateDataset, TimelinesPatientDataRow } from '../timelines/Data';
import { ConceptId } from '../concept/Concept';
import { DocumentSearchResult, NoteSearchResult, RadixTreeResult } from '../../providers/noteSearch/noteSearchWebWorker';
import { PatientListDatasetQuery } from '../patientList/Dataset';

export enum CohortStateType {
    REQUESTING = 1,
    NOT_LOADED = 2,
    LOADED = 3,
    IN_ERROR = 4,
    NOT_IMPLEMENTED = 5
}

/** 
 * Top-level aggregate state
 */ 
export interface CohortState {
    cancel?: CancelTokenSource;
    count: PatientCountState;
    networkCohorts: CohortMap;
    noteSearch: NoteSearchState;
    patientList: PatientListState;
    timelines: TimelinesState;
    visualization: VisualizationState;
}
export type CohortMap = Map<number, NetworkCohortState>;

/** 
 * Responder-level state
 */ 
export interface NetworkCohortState {
    count: PatientCountState;
    id: number;
    timelines: TimelinesNetworkState;
    patientList: PatientListNetworkState;
    visualization: VisualizationState;
}

/** 
 * State prop types
 */
export interface PatientCountState {
    cached: boolean;
    duration?: number;
    plusMinus: number;
    queryId: string;
    state: CohortStateType;
    sqlStatements: string[];
    value: number;
    withinLowCellThreshold: boolean;
}

export interface BasePatientListState {
    state: CohortStateType;
}

export interface PatientListState extends BasePatientListState {
    display: PatientListRow[];
    configuration: PatientListConfiguration;
    totalPatients: number;
    totalRows: number;
}

export interface PatientListNetworkState extends BasePatientListState {
    multiRowCount: number;
    singletonRowCount: number;
}

export interface BaseTimelinesState {
    
}

export interface TimelinesState extends BaseTimelinesState {
    aggregateData: TimelinesAggregateDataset;
    configuration: TimelinesConfiguration;
    indexConceptState: CohortStateType;
    patientData: TimelinesPatientDataRow[];
    state: CohortStateType;
}

export interface TimelinesNetworkState {
    indexConceptState: CohortStateType;

    // Network respondent needs to track state per concept (failed, succeeded, etc.)
    cohortStateByConcept: Map<ConceptId, CohortStateType>;
}

export interface VisualizationState {
    demographics: DemographicStatistics;
    state: CohortStateType;
}

export interface NoteSearchState {
    configuration: NoteSearchConfiguration;
    fullNote?: DocumentSearchResult;
    lookaheads: RadixTreeResult;
    terms: NoteSearchTerm[];
    results: NoteSearchResult;
}

export interface NoteSearchConfiguration extends BaseDatasetViewConfigurationConfiguration {
    datasets: Map<string, PatientListDatasetQuery>;
}

export interface NoteSearchTerm {
    color: string;
    text: string;
}