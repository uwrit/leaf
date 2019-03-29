/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PanelFilterAction, SET_PANEL_FILTERS, TOGGLE_PANEL_FILTER } from '../actions/panelFilter';
import { PanelFilter } from '../models/panel/PanelFilter';

export function defaultPanelFiltersState(): PanelFilter[] {
    return [];
}

const togglePanelFilter = (state: PanelFilter[], filter: PanelFilter, isActive: boolean): PanelFilter[] => {
    const newState = state.slice(0);
    const i = newState.findIndex((f: PanelFilter) => f.concept.id === filter.concept.id);
    newState[i].isActive = isActive;
    return newState;
}

const setPanelFilters = (state: PanelFilter[] = [], filters: PanelFilter[]) => {
    filters.forEach((pf: PanelFilter) => pf.isActive = false);
    return filters;
}

export const panelFilters = (state: PanelFilter[] = defaultPanelFiltersState(), action: PanelFilterAction): PanelFilter[] => {
    switch (action.type) {
        case TOGGLE_PANEL_FILTER:
            return togglePanelFilter(state, action.filter!, action.isActive!)
        case SET_PANEL_FILTERS:
            return setPanelFilters(state, action.filters!);
        default:
            return state;
    }
}