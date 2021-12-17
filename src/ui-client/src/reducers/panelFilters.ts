/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { 
    PanelFilterAction, 
    SET_PANEL_FILTERS, 
    TOGGLE_PANEL_FILTER, 
    SET_PANEL_FILTER_ACTIVE_STATES,
    DELETE_PANEL_FILTER
} from '../actions/panelFilter';
import { PanelFilter } from '../models/panel/PanelFilter';

export const defaultPanelFiltersState = (): PanelFilter[] => [];

const togglePanelFilter = (state: PanelFilter[], filter: PanelFilter, isActive: boolean): PanelFilter[] => {
    const newState = state.slice();
    const i = newState.findIndex((f: PanelFilter) => f.id === filter.id);
    newState[i] = Object.assign({}, newState[i], { isActive });
    return newState;
};

const setPanelFilters = (state: PanelFilter[] = [], filters: PanelFilter[]) => {
    const copy = state.slice();
    filters.forEach((pf: PanelFilter) => {
        pf.isActive = false;
        const i = copy.findIndex(c => c.id === pf.id);

        if (i > -1) {
            copy[i] = pf;
        } else {
            copy.push(pf);
        }
    });
    return copy;
};

const setPanelFilterActiveStates = (state: PanelFilter[] = [], filters: PanelFilter[]) => {
    const copy = state.slice();
    copy.forEach((f) => f.isActive = false)

    for (const filter of filters) {
        const i = copy.findIndex((f) => f.id === filter.id);
        if (i !== -1) {
            copy[i] = Object.assign({}, filter, { isActive: true });
        }
    }
    return copy;
};

export const panelFilters = (state: PanelFilter[] = defaultPanelFiltersState(), action: PanelFilterAction): PanelFilter[] => {
    switch (action.type) {
        case TOGGLE_PANEL_FILTER:
            return togglePanelFilter(state, action.filter!, action.isActive!)
        case SET_PANEL_FILTERS:
            return setPanelFilters(state, action.filters!);
        case SET_PANEL_FILTER_ACTIVE_STATES:
            return setPanelFilterActiveStates(state, action.filters!);
        case DELETE_PANEL_FILTER:
            return state.slice().filter(pf => pf.id !== action.filter!.id);
        default:
            return state;
    };
};