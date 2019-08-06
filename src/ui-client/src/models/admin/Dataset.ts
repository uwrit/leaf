/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PatientListDatasetShape } from "../patientList/Dataset";
import { Constraint } from "./Concept";
import { PatientListColumnType } from "../patientList/Column";

export interface AdminDemographicQuery {
    sqlStatement: string;
    lastChanged: string;
    changedBy: string;
}

export interface AdminDatasetQuery {
    id: string;
    categoryId?: number;
    constraints: Constraint[];
    description?: string;
    name: string;
    shape: PatientListDatasetShape;
    sqlStatement: string;
    tags: string[];
    universalId?: string;

    isEncounterBased: boolean;
    schema?: DynamicDatasetQuerySchema;
    sqlFieldDate?: string;
    sqlFieldValueString?: string;
    sqlFieldValueNumeric?: string;

    unsaved?: boolean;
    changed?: boolean;
}

export interface DatasetQueryCategory {
    id: number;
    category: string;
    changed?: boolean;
    unsaved?: boolean;
}

export interface DynamicDatasetQuerySchema {
    fields: DynamicDatasetQuerySchemaField[];
}

export interface DynamicDatasetQuerySchemaField {
    name: string;
    mask: boolean;
    required: boolean;
    type: PatientListColumnType;
    phi: boolean;
}