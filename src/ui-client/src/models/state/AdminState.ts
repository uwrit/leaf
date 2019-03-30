/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept, ConceptSqlSet } from '../admin/Concept';
import { Concept as UiConcept } from '../concept/Concept';
import { PanelFilter } from '../admin/PanelFilter';
import { AdminConfiguration } from '../admin/Configuration';
import { Panel } from '../panel/Panel';
import { AppState } from './AppState';

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

export type AdminPanelQueuedApiProcess = (dispatch: any, getState: () => AppState) => any;

export interface AdminPanelQueuedApiEvent {
    getProcess: () => AdminPanelQueuedApiProcess;
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
    sets: Map<number, ConceptSqlSet>;
    uneditedSets?: Map<number, ConceptSqlSet>;
    updateQueue: AdminPanelQueuedApiEvent[];
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
    state: AdminPanelLoadState;
}