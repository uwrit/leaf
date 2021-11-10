/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CohortStateType } from '../state/CohortState';
import { PatientListColumn, PatientListColumnId, PatientListColumnTemplate, ValueByColumnKey, PatientListColumnType } from './Column';
import { PatientListRowDTO } from './Patient';
import { DateBoundary } from '../panel/Date';

export type PatientListDatasetId = string;
export type SingletonDataByDatasetKey = Map<PatientListDatasetId, ValueByColumnKey>;
export type MultirowDataByDatasetKey = Map<PatientListDatasetId, PatientListRowDTO[]>;

/*
 * Type of summary dataset, used for description to user.
 */
export enum PatientListDatasetSummaryType {
    NonQuantititive = 1,
    Quantitative = 2
}

/*
 * Shape of the dataset. Largely aligns with
 * FHIR resources https://www.hl7.org/fhir/resourcelist.html
 * as flattened JSON objects. These tell the app
 * what columns to expect and how to compute summary statistics.
 */
export enum PatientListDatasetShape {
    Concept = -2,
    Dynamic = -1,
    Summary = 0,
    Observation = 1,
    Encounter = 2,
    Demographics = 3,
    Condition = 4,
    Procedure = 5,
    Immunization = 6,
    Allergy = 7,
    MedicationRequest = 8,
    MedicationAdministration = 9
}

/*
 * Actual object returned from server following dataset request.
 * [results] are a patientId-keyed array of arrays, and [schema]
 * are the fields returned from the DB.
 */
export interface PatientListDatasetDTO {
    results: PatientListDatasetResults;
    schema: PatientListDatasetSchema;
}

export interface PatientListDatasetSchema {
    fields: PatientListDatasetSchemaField[],
    shape: PatientListDatasetShape;
}

export interface PatientListDatasetDynamicSchema extends PatientListDatasetSchema {
    isEncounterBased: boolean;
    sqlFieldDate?: string;
    sqlFieldValueString?: string;
    sqlFieldValueNumeric?: string;
}

export interface PatientListDatasetSchemaField {
    name: string;
    type: PatientListColumnType;
}

interface PatientListDatasetResults {
    [p: string]: PatientListRowDTO[];
}

/*
 * A transform of the Dataset for REDCap conversion. Used on Export event.
 */
export interface PatientListDatasetExport {
    columns: PatientListColumn[];
    data: object[];
    datasetId: PatientListDatasetId;
    dateValueColumn?: string;
    isMultirow: boolean;
    maxRows: number;
}

/*
 * A description of the shape and type of dataset, shown to the user
 * as options in the patient list. These are loaded en masse on login.
 */
export interface PatientListDatasetQueryDTO {
    id: string;
    category: string;
    description?: string;
    name: string;
    isEncounterBased: boolean;
    shape: PatientListDatasetShape;
    tags: string[];
    universalId?: string;
}

export interface PatientListDatasetQuery extends PatientListDatasetQueryDTO {
    unsaved?: boolean;
}

/*
 * The 'true' dataset object sent to the web worker to cache results
 * for display in the UI. [data] is the actual rows and schema sent from
 * the DB, and [definition] is metadata used for displaying in the UI,
 * such as column names and their order.
 */
export interface PatientListDataset extends PatientListDatasetQueryDTO {
    data: PatientListDatasetDTO;
    definition: PatientListDatasetDefinition;
}

/*
 * Template for defining datasets. These are the foundation for
 * definitions, which tell the client what kind of columns and shape
 * to expect for a given dataset.
 */
export interface PatientListDatasetDefinitionTemplate {
    columns: Map<PatientListColumnId, PatientListColumnTemplate>;
    dateValueColumn?: string;
    multirow: boolean;
    numericValueColumn?: string;
    shape: PatientListDatasetShape;
    stringValueColumn?: string;
};

/*
 * The actual definition object. This is an instantiation of the template,
 * with columns not returned from the server removed, and addtional
 * metadata added (such as display name, id, etc.).
 */
export interface PatientListDatasetDefinition extends PatientListDatasetDefinitionTemplate {
    category?: string;
    columns: Map<PatientListColumnId, PatientListColumn>;
    dateBounds?: DateBoundary;
    displayName: string;
    encounterPanelIndex?: number;
    id: PatientListDatasetId;
    responderStates: Map<number, CohortStateType>;
    summaryType?: PatientListDatasetSummaryType;
    totalRows?: number;
};

/*
 * Tokenized ref to a dataset used internally by
 * the dataset search web worker.
 */
export interface TokenizedDatasetRef {
    id: PatientListDatasetId;
    dataset: PatientListDatasetQuery;
    token: string;
    tokenArray: string[];
}

/*
 * Cache index of the preceding and following dataset IDs currently shown.
 */
export interface PatientListDatasetQueryIndex {
    nextId: string;
    prevId: string;
}

/*
 * Datasets organized by category, used for display in DatasetContainer component.
 */
export interface CategorizedDatasetRef {
    category: string;
    datasets: Map<string, PatientListDatasetQuery>;
}

/*
 * Return object from the dataset search web worker.
 */
export interface DatasetSearchResult {
    categories: Map<string, CategorizedDatasetRef>;
    displayOrder: Map<string, PatientListDatasetQueryIndex>;
}