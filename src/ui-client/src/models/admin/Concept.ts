/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
    sqlFieldEvent?: string;
    sqlSetFrom: string;
    eventId?: number;
}

export interface ConceptSqlSet extends ConceptSqlSetDTO {
    changed?: boolean;
    specializationGroups: Map<number,SpecializationGroup>;
    unsaved?: boolean;
}

export interface ConceptEvent {
    id: number;
    uiDisplayEventName: string;
    changed?: boolean;
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
    specializationGroupId: number;
    orderId: number;
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
    isParent: boolean;
    isRoot: boolean;
    isPatientCountAutoCalculated: boolean;
    isSpecializable: boolean;
    isQueryable: boolean;
    constraints: Constraint[];
    specializationGroups: SpecializationGroupRelationship[];
    sqlSetId?: number;
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

    unsaved?: boolean;
}

export enum ConstraintType {
    User = 1,
    Group = 2
}

export interface Constraint {
    resourceId?: string;
    constraintId: ConstraintType;
    constraintValue: string;
}

export interface ConceptDeleteResponse {
    panelFilterCount: number;
    panelFilters: PanelFilterDependent[];
    queryCount: number;
    queries: QueryDependent[];
    conceptCount: number;
    concepts: ConceptDependent[];
}

export interface ConceptSqlSetDeleteResponse {
    conceptCount: number;
    concepts: ConceptDependent[];
    specializationGroupCount: number;
    specializationGroups: SpecializationGroupDependent[];
}

export interface SpecializationGroupDeleteResponse {
    conceptCount: number;
    concepts: ConceptDependent[];
}

interface PanelFilterDependent {
    id: number;
    uiDisplayText: string;
}

interface QueryDependent {
    id: string;
    universalId: string;
    name: string;
    owner: string;
}

interface ConceptDependent {
    id: string;
    universalId?: string;
    uiDisplayName: string;
}

interface SpecializationGroupDependent {
    id: string;
    uiDefaultText: string;
}