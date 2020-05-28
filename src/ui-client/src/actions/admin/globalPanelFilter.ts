/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { setNoClickModalState, showInfoModal, setSideNotificationState } from "../generalUi";
import { NotificationStates, InformationModalState } from "../../models/state/GeneralUiState";
import { GlobalPanelFilter } from "../../models/admin/GlobalPanelFilter";
import { createGlobalPanelFilter, updateGlobalPanelFilter, deleteGlobalPanelFilter } from "../../services/admin/globalPanelFilterApi";
import { getApiUpdateQueue } from "../../utils/admin/globalPanelFilter";

export const SET_ADMIN_GLOBAL_PANEL_FILTERS = 'SET_ADMIN_GLOBAL_PANEL_FILTERS';
export const REMOVE_ADMIN_GLOBAL_PANEL_FILTER = 'REMOVE_ADMIN_GLOBAL_PANEL_FILTER';
export const UNDO_ADMIN_GLOBAL_PANEL_FILTER_CHANGES = 'UNDO_ADMIN_GLOBAL_PANEL_FILTER_CHANGES';
export const SET_ADMIN_GLOBAL_PANEL_FILTERS_UNCHANGED = 'SET_ADMIN_GLOBAL_PANEL_FILTERS_UNCHANGED';

export interface AdminGlobalPanelFilterAction {
    changed?: boolean;
    pf?: GlobalPanelFilter;
    pfs?: GlobalPanelFilter[];
    type: string;
}

// Asynchronous
/*
 * Save or update a Global Panel Filter, depending on
 * if it is preexisting or new.
 */
export const saveOrUpdateAdminGlobalPanelFilter = async (pf: GlobalPanelFilter, dispatch: any, state: AppState): Promise<GlobalPanelFilter> => {
    let newPf = null;
    if (pf.unsaved) {
        newPf = await createGlobalPanelFilter(state, pf);
        dispatch(removeAdminGlobalPanelFilter(pf));
    } else {
        newPf = await updateGlobalPanelFilter(state, pf);
    }
    dispatch(setAdminGlobalPanelFilter(newPf, false));
    return newPf;
};

/*
 * Delete a existing Global Panel Filter.
 */
export const deleteAdminGlobalPanelFilter = (pf: GlobalPanelFilter) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NotificationStates.Working }));
            deleteGlobalPanelFilter(state, pf)
                .then(
                    response => {
                        dispatch(removeAdminGlobalPanelFilter(pf));
                        dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Deleted' }));
                },  error => {
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Global Panel Filter. Please see the Leaf error logs for details.",
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
 * Process all queued Global Panel Filter API operations sequentially.
 */
export const processApiUpdateQueue = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const pfs = state.admin!.globalPanelFilters.data;
        dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));

        try {
            const queue = getApiUpdateQueue(pfs, dispatch, state);
            for (const process of queue) {
                await process();
            }

            // All done!
            dispatch(setAdminGlobalPanelFiltersUnchanged());
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
export const setAdminGlobalPanelFilter = (pf: GlobalPanelFilter, changed: boolean): AdminGlobalPanelFilterAction => {
    return {
        pfs: [ pf ],
        changed,
        type: SET_ADMIN_GLOBAL_PANEL_FILTERS
    };
};

export const undoAdminGlobalPanelFilterChanges = (): AdminGlobalPanelFilterAction => {
    return {
        type: UNDO_ADMIN_GLOBAL_PANEL_FILTER_CHANGES
    };
};

export const setAdminGlobalPanelFiltersUnchanged = (): AdminGlobalPanelFilterAction => {
    return {
        type: SET_ADMIN_GLOBAL_PANEL_FILTERS_UNCHANGED
    };
};

export const setAdminGlobalPanelFilters = (pfs: GlobalPanelFilter[]): AdminGlobalPanelFilterAction => {
    return {
        pfs,
        type: SET_ADMIN_GLOBAL_PANEL_FILTERS
    };
};

export const removeAdminGlobalPanelFilter = (pf: GlobalPanelFilter): AdminGlobalPanelFilterAction => {
    return {
        pf,
        type: REMOVE_ADMIN_GLOBAL_PANEL_FILTER
    };
};
