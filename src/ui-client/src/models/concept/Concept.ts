/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { ConceptMap } from '../state/AppState';
import { PanelFilter } from '../panel/PanelFilter';

export enum ConceptExtensionType {
    SavedQuery = 1
}

export interface BaseConcept {
    id: string;
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
    specializationGroups?: ConceptSpecializationGroup[];

    uiDisplayName: string;
    uiDisplayText: string;
    uiDisplaySubtext?: string;
    uiDisplayUnits?: string;
    uiDisplayTooltip?: string;
    uiDisplayPatientCount?: number;
    uiDisplayPatientCountByYear?: PatientCountPerYear[];
    uiNumericDefaultText?: string;

    // client-only props
    childrenIds?: Set<string>;
    childrenLoaded: boolean;
    isExtension?: boolean;
    isOpen: boolean;
    isFetching: boolean;
}

export interface ExtensionConcept extends Concept {
    extensionId: string;
    extensionType?: ConceptExtensionType;
    injectChildrenOnDrop?: Concept[];
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

export interface PatientCountPerYear {
    // Need to allow '?' as a valid year (meaning unknown), so [year] is string
    year: string;          
    label?: string;
    patientCount: number;
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