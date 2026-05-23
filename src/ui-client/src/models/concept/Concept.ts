/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { ConceptMap } from '../state/AppState';
import { PanelFilter } from '../panel/PanelFilter';

export type ConceptId = string;

export interface BaseConcept {
    id: ConceptId;
    universalId?: string;
}

export interface Concept extends BaseConcept {
    parentId?: string;
    rootId: string;
    isNumeric: boolean;
    isEventBased: boolean;
    isParent: boolean;
    isEncounterBased: boolean;
    isPatientCountAutoCalculated: boolean;
    isSpecializable: boolean;
    isQueryable: boolean;
    isRoot?: boolean;
    specializationGroups?: ConceptSpecializationGroup[];
    eventTypeId?: number;

    uiDisplayName: string;
    uiDisplayText: string;
    uiDisplaySubtext?: string;
    uiDisplayUnits?: string;
    uiDisplayTooltip?: string;
    uiDisplayPatientCount?: number;
    uiDisplayPatientCountByYear?: PatientCountPerYear[];
    uiDisplayEventName?: string;
    uiNumericDefaultText?: string;

    // client-only props
    childrenIds?: Set<string>;
    childrenLoaded: boolean;
    childrenOnDrop?: Concept[];
    extensionId?: string;
    isExtension?: boolean;
    isOpen: boolean;
    isFetching: boolean;
    unsaved?: boolean;
}

export interface ConceptSpecialization {
    id: string;
    specializationGroupId: number;
    uiDisplayText: string;
    universalId?: string;
}

export interface ConceptSpecializationGroup {
    orderId?: number;
    specializations: ConceptSpecialization[];
    id: number;
    uiDefaultText: string;
}

export interface DisplayablePatientCountPerYear {
    label?: string;
    patientCount: number;
    year?: any;
}

export interface PatientCountPerYear extends DisplayablePatientCountPerYear {
    year?: number;
}

export interface PatientCountPerYearGrouped extends DisplayablePatientCountPerYear {
    year: string;
}

export interface ConceptParentsDTO {
    concepts: Concept[];
    panelFilters: PanelFilter[];
}

export interface ResourceRef extends BaseConcept {
    uiDisplayName: string;
}

export interface ConceptExtensionInitializer {
    concepts: ConceptMap;
    roots: string[];
}