/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept } from "../concept/Concept";
import { AppConfig, UserContext } from "../Auth";
import { ConceptEquivalentHint, AggregateConceptHintRef } from "../concept/ConceptHint";
import { Viewport } from "./Map";
import { CohortState } from "./CohortState";
import ExportState from "./Export";
import { PanelFilter } from "../panel/PanelFilter";
import { GeneralUiState } from "./GeneralUiState";
import { NetworkResponderMap } from "../NetworkResponder";
import { Panel } from "../panel/Panel";
import { SavedQueriesState } from "../Query";
import { SessionState } from "../Session";
import AdminState from "./AdminState";
import { PatientListDatasetQuery, CategorizedDatasetRef, PatientListDatasetQueryIndex } from "../patientList/Dataset";
import ImportState from "./Import";

export type ConceptMap = Map<string, Concept>;

export interface AuthorizationState {
    config?: AppConfig;
    error?: string;
    userContext?: UserContext;
}

export interface ConceptsState {
    allowRerender: Set<string>;
    currentTree: ConceptMap;
    drillTree: ConceptMap;
    requestingSearchTree: boolean;
    roots: string[];
    searchTree: ConceptMap;
    selectedId: string;
    showSearchTree: boolean;
}

export interface ConceptsSearchState {
    currentEquivalentHint: ConceptEquivalentHint;
    currentHints: AggregateConceptHintRef[];
    equivalentHintTerm: string;
    error?: string;
    isFetching: boolean;
    rootId: string;
    term: string;
}

export interface MapState {
    viewport: Viewport;
}

export interface DatasetsState {
    all: Map<string, PatientListDatasetQuery>;
    display: Map<string, CategorizedDatasetRef>;
    displayOrder: Map<string, PatientListDatasetQueryIndex>;
    searchTerm: string;
    selected: string;
}

export interface AppState {
    admin?: AdminState;
    auth: AuthorizationState;
    concepts: ConceptsState;
    conceptSearch: ConceptsSearchState;
    cohort: CohortState;
    dataExport: ExportState;
    dataImport: ImportState;
    datasets: DatasetsState;
    panelFilters: PanelFilter[];
    generalUi: GeneralUiState;
    map: MapState;
    responders: NetworkResponderMap;
    panels: Panel[];
    queries: SavedQueriesState;
    session: SessionState;
}