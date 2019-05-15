/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CancelTokenSource } from 'axios';
import { PatientListConfiguration } from '../patientList/Configuration';
import { PatientListRow } from '../patientList/Patient';
import { DemographicStatistics } from '../cohort/DemographicDTO';

export enum CohortStateType {
    REQUESTING = 1,
    NOT_LOADED = 2,
    LOADED = 3,
    IN_ERROR = 4,
    NOT_IMPLEMENTED = 5
}

// Top-level aggregate state
export interface CohortState {
    cancel?: CancelTokenSource;
    count: PatientCountState;
    networkCohorts: CohortMap;
    patientList: PatientListState;
    visualization: VisualizationState;
}
export type CohortMap = Map<number, NetworkCohortState>;

// Responder-level state
export interface NetworkCohortState {
    count: PatientCountState;
    id: number;
    patientList: PatientListNetworkState;
    visualization: VisualizationState;
}

// State prop types
export interface PatientCountState {
    duration?: number;
    queryId: string;
    state: CohortStateType;
    sqlStatements: string[];
    value: number;
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
    state: CohortStateType;
    multiRowCount: number;
    singletonRowCount: number;
}

export interface VisualizationState {
    demographics: DemographicStatistics;
    state: CohortStateType;
}