/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
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

interface BaseAdminDatasetQuery {
    id: string;
    universalId?: string;
    categoryId?: number;
    constraints: Constraint[];
    description?: string;
    name: string;
    shape: PatientListDatasetShape;
    sqlStatement: string;
    tags: string[];
    isEncounterBased: boolean;
    sqlFieldDate?: string;
    sqlFieldValueString?: string;
    sqlFieldValueNumeric?: string;
    unsaved?: boolean;
    changed?: boolean;
}

export interface AdminDatasetQueryDTO extends BaseAdminDatasetQuery {
    schema?: DynamicDatasetQuerySchemaDTO;
}

export interface AdminDatasetQuery extends BaseAdminDatasetQuery {
    schema?: DynamicDatasetQuerySchema;
}

export interface DatasetQueryCategory {
    id: number;
    category: string;
    changed?: boolean;
    unsaved?: boolean;
}

export interface DynamicDatasetQuerySchemaDTO {
    fields: DynamicDatasetQuerySchemaFieldDTO[];
}

export interface DynamicDatasetQuerySchema {
    fields: DynamicDatasetQuerySchemaField[];
}

interface BaseDynamicDatasetQuerySchemaField {
    name: string;
    mask: boolean;
    required: boolean;
    phi: boolean;
}

export interface DynamicDatasetQuerySchemaFieldDTO extends BaseDynamicDatasetQuerySchemaField {
    type: string;
}

export interface DynamicDatasetQuerySchemaField extends BaseDynamicDatasetQuerySchemaField {
    present: boolean;
    type: PatientListColumnType;
}

export const fromDTO = (dto: AdminDatasetQueryDTO): AdminDatasetQuery => {
    const ds = {
        ...dto,
        schema: dto.schema 
            ? { fields: dto.schema.fields.map(f => ({ ...f, type: PatientListColumnType[f.type as any], present: true })) } as any
            : { fields: [] }
    };
    return ds;
};

export const toDTO = (ds: AdminDatasetQuery): AdminDatasetQueryDTO => {
    const dto: AdminDatasetQueryDTO = {
        ...ds,
        schema: ds.schema 
            ? { fields: ds.schema.fields.map(f => (
                { 
                    name: f.name, 
                    mask: f.mask, 
                    phi: f.phi, 
                    required: true, 
                    type: PatientListColumnType[f.type]
                }) ) 
              }
            : { fields: [] }
    };
    return dto;
};