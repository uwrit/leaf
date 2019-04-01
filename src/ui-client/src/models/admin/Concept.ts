/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientCountPerYear } from "../concept/Concept";

export interface ConceptSqlSetDTO {
    id: number,
    isEncounterBased: boolean;
    isEventBased: boolean;
    sqlFieldDate?: string;
    sqlFieldEventId?: string;
    sqlSetFrom: string;
}

export interface ConceptSqlSet extends ConceptSqlSetDTO {
    changed?: boolean;
    specializationGroups: Map<number,SpecializationGroup>;
    unsaved?: boolean;
}

export interface SpecializationGroupDTO {
    id: number;
    sqlSetId: number;
    specializations: Specialization[];
    uiDefaultText: string;
}

export interface SpecializationGroup {
    changed?: boolean;
    id: number;
    sqlSetId: number;
    specializations: Map<string,Specialization>;
    uiDefaultText: string;
    unsaved?: boolean;
}

export interface SpecializationGroupRelationship {
    specializationGroupId: number
    orderId?: number
}

export interface SpecializationDTO {
    id: string;
    specializationGroupId: number;
    orderId?: number;
    sqlSetWhere: string;
    uiDisplayText: string;
    universalId?: string;
}

export interface Specialization extends SpecializationDTO {
    changed?: boolean;
    sqlSetId: number;
    unsaved?: boolean;
}

export interface Concept {
    id: string;
    parentId?: string;
    rootId: string;
    externalId?: string;
    externalParentId?: string;
    universalId?: string;
    
    isNumeric: boolean;
    isEventBased: boolean;
    isParent: boolean;
    isRoot: boolean;
    isPatientCountAutoCalculated: boolean;
    isSpecializable: boolean;

    constraints: ConceptConstraint[];

    specializationGroups: SpecializationGroupRelationship[];

    sqlSetId: number;
    sqlSetWhere?: string;
    sqlFieldNumeric?: string;

    uiDisplayName: string;
    uiDisplayText: string;
    uiDisplaySubtext?: string;
    uiDisplayUnits?: string;
    uiDisplayTooltip?: string;
    uiDisplayPatientCount?: number;
    uiDisplayPatientCountByYear?: PatientCountPerYear[];
    uiDisplayRowOrder?: number;
    uiNumericDefaultText?: string;
}

export enum ConstraintType {
    User = 1,
    Group = 2
}

export interface ConceptConstraint {
    conceptId: string;
    constraintId: ConstraintType;
    constraintValue: string;
}