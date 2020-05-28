/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { setNoClickModalState, showInfoModal, setSideNotificationState } from "../generalUi";
import { NotificationStates, InformationModalState } from "../../models/state/GeneralUiState";
import { PanelFilter } from "../../models/admin/PanelFilter";
import { PanelFilter as UserPanelFilter } from "../../models/panel/PanelFilter";
import { createPanelFilter, updatePanelFilter, deletePanelFilter } from "../../services/admin/panelFilterApi";
import { getApiUpdateQueue } from "../../utils/admin/panelFilter";
import { setPanelFilters, removePanelFilter } from "../panelFilter";

export const SET_ADMIN_PANEL_FILTERS = 'SET_ADMIN_PANEL_FILTERS';
export const SET_ADMIN_PANEL_FILTERS_UNCHANGED = 'SET_ADMIN_PANEL_FILTERS_UNCHANGED';
export const UNDO_ADMIN_PANEL_FILTER_CHANGES = 'UNDO_ADMIN_PANEL_FILTER_CHANGES';
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
    dispatch(setPanelFilters([ derivePanelFilterFromAdminPanelFilter(newPf) ]));
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
                        dispatch(removePanelFilter(derivePanelFilterFromAdminPanelFilter(pf)));
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

/*
 * Process all queued Panel Filter API operations sequentially.
 */
export const processApiUpdateQueue = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const pfs = state.admin!.panelFilters.data;
        dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));

        try {
            const queue = getApiUpdateQueue(pfs, dispatch, state);
            for (const process of queue) {
                await process();
            }

            // All done!
            dispatch(setAdminPanelFiltersUnchanged());
            dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Changes Saved' }));
        } catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "An error occurred while attempting update the Leaf database with your changes. Please see the Leaf error logs for details.",
                header: "Error Applying Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        } finally {
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
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

export const undoAdminPanelFilterChanges = (): AdminPanelFilterAction => {
    return {
        type: UNDO_ADMIN_PANEL_FILTER_CHANGES
    };
};

export const setAdminPanelFiltersUnchanged = (): AdminPanelFilterAction => {
    return {
        type: SET_ADMIN_PANEL_FILTERS_UNCHANGED
    };
};

export const removeAdminPanelFilter = (pf: PanelFilter): AdminPanelFilterAction => {
    return {
        pf,
        type: REMOVE_ADMIN_PANEL_FILTER
    };
};

const derivePanelFilterFromAdminPanelFilter = (apf: PanelFilter): UserPanelFilter => {
    return {
        id: apf.id,
        isActive: false,
        isInclusion: apf.isInclusion,
        concept: apf.concept!,
        uiDisplayText: apf.uiDisplayText,
        uiDisplayDescription: apf.uiDisplayDescription,
    };
};
