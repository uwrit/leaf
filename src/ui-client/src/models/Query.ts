/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Panel } from './panel/Panel';
import { PreflightCheckDTO } from './PatientCountDTO';
import { PanelFilter } from './panel/PanelFilter';

export interface BaseQuery {
    category: string;
    description?: string;
    name: string;
}

export interface Query extends BaseQuery {
    id?: string;
    universalId?: string;
}

export type SavedQueryMap = Map<string, SavedQueryRef>

export interface SavedQueriesState {
    current: Query;
    currentChangeId: string;
    lastSavedChangeId: string;
    saved: SavedQueryMap;
    runAfterSave: any;
}

export interface SavedQueryRefDTO extends BaseQuery {
    count: number;
    created: string;
    definition: string;
    updated: string;
    id: string;
    owner: string;
    universalId: string;
}

export interface SavedQueryRef extends BaseQuery {
    count: number;
    created: Date;
    updated: Date;
    id: string;
    owner: string;
    ownerShort: string;
    ownerScope: string;
    universalId: string;
}

export interface SavedQuery extends SavedQueryRef {
    panels: Panel[];
    panelFilters: PanelFilter[];
}

export interface SavedQueryDefinitionDTO {
    panels: Panel[];
    panelFilters: PanelFilter[];
}

export interface QuerySaveResponseDTO {
    preflight: PreflightCheckDTO;
    query: QuerySaveResultDTO;
}

export interface QuerySaveResultDTO {
    id: string;
    universalId: string;
    ver: number;
}

export interface QueryDependent {
    id: string;
    universalId: string;
    name: string;
    owner: string; 
}