/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept as AdminConcept, ConceptSqlSet, ConceptEvent } from '../admin/Concept';
import { Concept as UserConcept } from '../concept/Concept';
import { PanelFilter } from '../admin/PanelFilter';
import { AdminConfiguration } from '../admin/Configuration';
import { Panel } from '../panel/Panel';
import { AdminDatasetQuery } from '../admin/Dataset';
import { AdminPanelPatientListColumnTemplate } from '../patientList/Column';


export enum AdminPanelLoadState {
    NOT_LOADED = 1,
    LOADING = 2,
    LOADED = 3,
    ERROR = 4,
    NOT_APPLICABLE = 5
}

export enum AdminPanelPane {
    CONCEPTS = 1,
    DATASETS = 2
}

export enum AdminPanelConceptEditorPane {
    MAIN = 1,
    SQL_SET = 2
}

export interface AdminConceptState {
    changed: boolean;
    concepts: Map<string, AdminConcept>;
    currentAdminConcept?: AdminConcept;
    currentUserConcept?: UserConcept;
    examplePanel: Panel;
    exampleSql: string;
    state: AdminPanelLoadState;
}

export interface AdminConceptEventState {
    changed: boolean;
    events: Map<number,ConceptEvent>;
    uneditedEvent?: ConceptEvent;
}

export interface AdminPanelSqlSetState {
    changed: boolean;
    sets: Map<number, ConceptSqlSet>;
    uneditedSets?: Map<number, ConceptSqlSet>;
}

export interface AdminPanelFilterState {
    changed: boolean;
    panelFilters: Map<number, PanelFilter>;
}

export interface AdminDatasetState {
    changed: boolean;
    columns: AdminPanelPatientListColumnTemplate[];
    currentDataset?: AdminDatasetQuery;
    datasets: Map<string, AdminDatasetQuery>;
    state: AdminPanelLoadState;
}

export default interface AdminState {
    activePane: AdminPanelPane;
    activeSubPane: number;
    concepts: AdminConceptState;
    conceptEvents: AdminConceptEventState;
    configuration: AdminConfiguration;
    datasets: AdminDatasetState;
    panelFilters: AdminPanelFilterState;
    sqlSets: AdminPanelSqlSetState;
    state: AdminPanelLoadState;
}