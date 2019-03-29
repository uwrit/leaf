/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept, ConceptSqlSet, SpecializationGroup, Specialization } from '../admin/Concept';
import { Concept as UiConcept } from '../concept/Concept';
import { PanelFilter } from '../admin/PanelFilter';
import { AdminConfiguration } from '../admin/Configuration';
import { Panel } from '../panel/Panel';

export enum AdminPanelLoadState {
    NOT_LOADED = 1,
    LOADING = 2,
    LOADED = 3,
    ERROR = 4,
    NOT_APPLICABLE = 5
}

export enum AdminPanelConceptEditorPane {
    MAIN = 1,
    SQL_SET = 2
}

export enum AdminPanelUpdateObjectType {
    SQL_SET = 1,
    SPECIALIZATION_GROUP = 2,
    SPECIALIZATION = 3
}

export interface AdminPanelQueuedApiEvent {
    event: () => any;
    id: string | number;
    objectType: AdminPanelUpdateObjectType;
}

export interface AdminConceptState {
    changed: boolean;
    concepts: Map<string,Concept>;
    currentConcept?: Concept;
    pane: AdminPanelConceptEditorPane;
    examplePanel: Panel;
    exampleSql: string;
    state: AdminPanelLoadState;
    uneditedAdminConcept?: Concept;
    uneditedUiConcept?: UiConcept;
}

export interface AdminPanelSqlSetState {
    changed: boolean;
    currentSet?: ConceptSqlSet;
    sets: Map<number, ConceptSqlSet>;
    uneditedSet?: ConceptSqlSet;
    unsavedSets: Map<number, ConceptSqlSet>;
    updateQueue: AdminPanelQueuedApiEvent[];
}

export interface AdminPanelSpecializationGroupState {
    specializationChanged: boolean;
    groupChanged: boolean;
    currentGroup?: SpecializationGroup;
    currentSpecialization?: Specialization;
    uneditedGroup?: SpecializationGroup;
    uneditedSpecialization?: Specialization;
}

export interface AdminPanelFilterState {
    changed: boolean;
    panelFilters: Map<number, PanelFilter>;
}

export interface AdminDatasetState {
    
}

export default interface AdminState {
    activeTab: number;
    concepts: AdminConceptState;
    configuration: AdminConfiguration;
    datasets: AdminDatasetState;
    panelFilters: AdminPanelFilterState;
    sqlSets: AdminPanelSqlSetState;
    specializationGroups: AdminPanelSpecializationGroupState;
    state: AdminPanelLoadState;
}