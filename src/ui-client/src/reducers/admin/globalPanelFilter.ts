/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminGlobalPanelFilterAction } from "../../actions/admin/globalPanelFilter";
import { GlobalPanelFilter } from "../../models/admin/GlobalPanelFilter";

export const setAdminGlobalPanelFilters = (state: AdminState, action: AdminGlobalPanelFilterAction): AdminState => {
    const pfs = action.pfs!;
    let unedited = state.globalPanelFilters.unedited;
    for (const pf of pfs) {
        state.globalPanelFilters.data.set(pf.id, Object.assign({}, pf));
    }

    if (!action.changed) {
        unedited = new Map(state.globalPanelFilters.data);
    }

    return Object.assign({}, state, {
        globalPanelFilters: {
            ...state.globalPanelFilters,
            data: new Map(state.globalPanelFilters.data),
            changed: action.changed,
            unedited
        },
    });
};

export const setAdminUneditedGlobalPanelFilter = (state: AdminState, action: AdminGlobalPanelFilterAction): AdminState => {
    const unedited: Map<number, GlobalPanelFilter> = new Map();
    action.pfs!.forEach(pf => unedited.set(pf.id, pf));

    return Object.assign({}, state, {
        globalPanelFilters: {
            ...state.globalPanelFilters,
            unedited
        }
    });
};

export const undoAdminGlobalPanelFilterChanges = (state: AdminState, action: AdminGlobalPanelFilterAction): AdminState => {
    return Object.assign({}, state, {
        globalPanelFilters: {
            ...state.globalPanelFilters,
            data: state.globalPanelFilters.unedited,
            unedited: new Map(state.globalPanelFilters.unedited!),
            changed: false
        }
    });
};

export const deleteAdminGlobalPanelFilter = (state: AdminState, action: AdminGlobalPanelFilterAction): AdminState => {
    const pf = action.pf!;
    state.globalPanelFilters.unedited!.delete(pf.id);
    state.globalPanelFilters.data.delete(pf.id);

    return Object.assign({}, state, {
        globalPanelFilters: {
            ...state.globalPanelFilters,
            data: new Map(state.globalPanelFilters.data),
        }
    });
};

export const setAdminGlobalPanelFiltersUnchanged = (state: AdminState, action: AdminGlobalPanelFilterAction): AdminState => {
    return Object.assign({}, state, {
        panelFilters: {
            ...state.panelFilters,
            changed: false,
            unedited: new Map(state.panelFilters.data)
        }
    });
};