/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminPanelFilterAction } from "../../actions/admin/panelFilter";
import { PanelFilter } from "../../models/admin/PanelFilter";

export const setAdminPanelFilters = (state: AdminState, action: AdminPanelFilterAction): AdminState => {
    const pfs = action.pfs!;
    let unedited = state.panelFilters.unedited;
    for (const pf of pfs) {
        state.panelFilters.data.set(pf.id, Object.assign({}, pf));
    }

    if (!action.changed) {
        unedited = new Map(state.panelFilters.data);
    }

    return Object.assign({}, state, {
        panelFilters: {
            ...state.panelFilters,
            data: new Map(state.panelFilters.data),
            changed: action.changed,
            unedited
        },
    });
};

export const setAdminUneditedPanelFilter = (state: AdminState, action: AdminPanelFilterAction): AdminState => {
    const unedited: Map<number, PanelFilter> = new Map();
    action.pfs!.forEach(pf => unedited.set(pf.id, pf));

    return Object.assign({}, state, {
        panelFilters: {
            ...state.panelFilters,
            unedited
        }
    });
};

export const undoAdminPanelFilterChanges = (state: AdminState, action: AdminPanelFilterAction): AdminState => {
    return Object.assign({}, state, {
        panelFilters: {
            ...state.panelFilters,
            data: state.panelFilters.unedited,
            unedited: new Map(state.panelFilters.unedited!),
            changed: false
        }
    });
};

export const deleteAdminPanelFilter = (state: AdminState, action: AdminPanelFilterAction): AdminState => {
    const pf = action.pf!;
    state.panelFilters.unedited!.delete(pf.id);
    state.panelFilters.data.delete(pf.id);

    return Object.assign({}, state, {
        panelFilters: {
            ...state.panelFilters,
            data: new Map(state.panelFilters.data),
        }
    });
};

export const setAdminPanelFiltersUnchanged = (state: AdminState, action: AdminPanelFilterAction): AdminState => {
    return Object.assign({}, state, {
        panelFilters: {
            ...state.panelFilters,
            changed: false,
            unedited: new Map(state.panelFilters.data)
        }
    });
};