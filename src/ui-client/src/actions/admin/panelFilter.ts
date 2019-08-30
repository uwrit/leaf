/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { setNoClickModalState, showInfoModal, setSideNotificationState } from "../generalUi";
import { NotificationStates, InformationModalState } from "../../models/state/GeneralUiState";
import { PanelFilter } from "../../models/admin/PanelFilter";
import { createPanelFilter, updatePanelFilter, deletePanelFilter } from "../../services/admin/panelFilterApi";

export const SET_ADMIN_PANEL_FILTERS = 'SET_ADMIN_PANEL_FILTERS';
export const REMOVE_ADMIN_PANEL_FILTER = 'REMOVE_ADMIN_PANEL_FILTER';

export interface AdminPanelFilterAction {
    changed?: boolean;
    pf?: PanelFilter;
    pfs?: PanelFilter[];
    type: string;
}

// Asynchronous
/*
 * Save or update a Panel Filter, depending on
 * if it is preexisting or new.
 */
export const saveOrUpdateAdminPanelFilter = async (pf: PanelFilter, dispatch: any, state: AppState): Promise<PanelFilter> => {
    let newPf = null;
    if (pf.unsaved) {
        newPf = await createPanelFilter(state, pf);
        dispatch(removeAdminPanelFilter(pf));
    } else {
        newPf = await updatePanelFilter(state, pf);
    }
    dispatch(setAdminPanelFilter(newPf, false));
    return newPf;
};

/*
 * Delete a existing Panel Filter.
 */
export const deleteAdminPanelFilter = (pf: PanelFilter) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NotificationStates.Working }));
            deletePanelFilter(state, pf)
                .then(
                    response => {
                        dispatch(removeAdminPanelFilter(pf));
                        dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Panel Filter Deleted' }));
                },  error => {
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Panel Filter. Please see the Leaf error logs for details.",
                            header: "Error Deleting Panel Filter",
                            show: true
                        };
                        dispatch(showInfoModal(info));
                }).then(() => dispatch(setNoClickModalState({ state: NotificationStates.Hidden })));
        } catch (err) {
            console.log(err);
        }
    }
};

// Synchronous
export const setAdminPanelFilter = (pf: PanelFilter, changed: boolean): AdminPanelFilterAction => {
    return {
        pfs: [ pf ],
        changed,
        type: SET_ADMIN_PANEL_FILTERS
    };
};

export const setAdminPanelFilters = (pfs: PanelFilter[]): AdminPanelFilterAction => {
    return {
        pfs,
        type: SET_ADMIN_PANEL_FILTERS
    };
};

export const removeAdminPanelFilter = (pf: PanelFilter): AdminPanelFilterAction => {
    return {
        pf,
        type: REMOVE_ADMIN_PANEL_FILTER
    };
};
