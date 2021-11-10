/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PanelFilter } from '../models/panel/PanelFilter';

export const TOGGLE_PANEL_FILTER = 'TOGGLE_PANEL_FILTER';
export const SET_PANEL_FILTER_ACTIVE_STATES = 'SET_PANEL_FILTER_ACTIVE_STATES';
export const SET_PANEL_FILTERS = 'SET_PANEL_FILTERS';
export const DELETE_PANEL_FILTER = 'DELETE_PANEL_FILTER';

export interface PanelFilterAction {
    isActive?: boolean;
    filter?: PanelFilter;
    filters?: PanelFilter[];
    error?: string;
    type: string;
}

export const togglePanelFilter = (filter: PanelFilter, isActive: boolean): PanelFilterAction => {
    return {
        filter,
        isActive,
        type: TOGGLE_PANEL_FILTER
    };
};

export const setPanelFilters = (filters: PanelFilter[]): PanelFilterAction => {
    return {
        filters,
        type: SET_PANEL_FILTERS
    };
};

export const setPanelFilterActiveStates = (filters: PanelFilter[]): PanelFilterAction => {
    return {
        filters,
        type: SET_PANEL_FILTER_ACTIVE_STATES
    }
};

export const removePanelFilter = (filter: PanelFilter): PanelFilterAction => {
    return {
        filter,
        type: DELETE_PANEL_FILTER
    }
};

