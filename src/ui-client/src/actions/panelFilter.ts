/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PanelFilter } from '../models/panel/PanelFilter';

export const TOGGLE_PANEL_FILTER = 'TOGGLE_PANEL_FILTER';
export const SET_PANEL_FILTERS = 'SET_PANEL_FILTERS';

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