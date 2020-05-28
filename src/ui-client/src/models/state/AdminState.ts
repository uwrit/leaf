/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
import { AdminDatasetQuery, DatasetQueryCategory } from '../admin/Dataset';
import { AdminPanelPatientListColumnTemplate } from '../patientList/Column';
import { NetworkIdentity } from '../NetworkResponder';
import { NetworkEndpoint, Certificate } from '../admin/Network';
import { GlobalPanelFilter } from '../admin/GlobalPanelFilter';
import { LeafUser } from '../admin/LeafUser';
import { SavedQueryRef } from '../Query';


export enum AdminPanelLoadState {
    NOT_LOADED = 1,
    LOADING = 2,
    LOADED = 3,
    ERROR = 4,
    NOT_APPLICABLE = 5
}

export enum AdminPanelPane {
    CONCEPTS = 1,
    SQL_SETS = 2,
    PANEL_FILTERS = 3,
    GLOBAL_PANEL_FILTERS = 4,
    DATASETS = 5,
    NETWORK = 6
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
    data: Map<number, PanelFilter>;
    unedited?: Map<number, PanelFilter>;
}

export interface AdminGlobalPanelFilterState {
    changed: boolean;
    data: Map<number, GlobalPanelFilter>;
    unedited?: Map<number, GlobalPanelFilter>;
}

export interface AdminDatasetState {
    changed: boolean;
    expectedColumns: AdminPanelPatientListColumnTemplate[];
    currentDataset?: AdminDatasetQuery;
    datasets: Map<string, AdminDatasetQuery>;
    demographicsDataset: AdminDatasetQuery;
    sqlColumns: Set<string>;
    state: AdminPanelLoadState;
}

export interface AdminDatasetQueryCategoryState {
    changed: boolean;
    categories: Map<number,DatasetQueryCategory>;
    uneditedCategory?: DatasetQueryCategory;
}

export interface AdminNetworkAndIdentityState {
    changed: boolean;
    endpoints: Map<number,NetworkEndpoint>;
    identity: NetworkIdentity;
    modal: AdminNetworkCertificateModalState;
    uneditedEndpoints: Map<number,NetworkEndpoint>;
    uneditedIdentity: NetworkIdentity;
}

export interface AdminNetworkCertificateModalState {
    cert?: Certificate;
    endpoint?: NetworkEndpoint;
    show: boolean;
}

export interface AdminUserQueryState {
    fetchingQueries: boolean;
    fetchingUsers: boolean;
    queries: SavedQueryRef[];
    searchTerm: string;
    users: LeafUser[];
}

export default interface AdminState {
    activePane: AdminPanelPane;
    concepts: AdminConceptState;
    conceptEvents: AdminConceptEventState;
    configuration: AdminConfiguration;
    datasets: AdminDatasetState;
    datasetQueryCategories: AdminDatasetQueryCategoryState;
    globalPanelFilters: AdminGlobalPanelFilterState;
    networkAndIdentity: AdminNetworkAndIdentityState;
    panelFilters: AdminPanelFilterState;
    sqlSets: AdminPanelSqlSetState;
    state: AdminPanelLoadState;
    userQueries: AdminUserQueryState;
}