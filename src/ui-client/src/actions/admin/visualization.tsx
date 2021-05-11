/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from "../../models/state/AppState";
import { setNoClickModalState, showInfoModal, setSideNotificationState } from "../generalUi";
import { NotificationStates, InformationModalState } from "../../models/state/GeneralUiState";
import {
    createAdminVisualiationPage, 
    updateAdminVisualiationPage, 
    deleteAdminVisualizationPage
} from "../../services/admin/visualiationApi";
import { AdminVisualizationPage } from "../../models/admin/Visualization";
import { VisualizationDatasetQueryRef, VisualizationPage } from "../../models/visualization/Visualization";
import { CohortStateType } from "../../models/state/CohortState";
import { NetworkIdentity } from "../../models/NetworkResponder";
import { fetchVisualizationDataset } from "../../services/visualizationApi";
import { PatientListDatasetDTO } from "../../models/patientList/Dataset";
import { combineDatasets } from "../../services/cohortAggregatorApi";

export const SET_ADMIN_VISUALIZATIONS = 'SET_ADMIN_VISUALIZATIONS';
export const SET_ADMIN_VISUALIZATION = 'SET_ADMIN_VISUALIZATION';
export const UNDO_ADMIN_VISUALIZATION_CHANGE = 'UNDO_ADMIN_VISUALIZATION_CHANGE';
export const REMOVE_ADMIN_VISUALIZATION = 'REMOVE_ADMIN_VISUALIZATION';
export const SET_ADMIN_VISUALIZATION_DATASETS = 'SET_ADMIN_VISUALIZATION_DATASETS';
export const SET_ADMIN_VISUALIZATION_CURRENT = 'SET_ADMIN_VISUALIZATION_CURRENT';
export const SET_ADMIN_VISUALIZATION_DATASET_QUERY_STATE = 'SET_ADMIN_VISUALIZATION_DATASET_QUERY_STATE';
export const SET_ADMIN_VISUALIZATION_DATASET_QUERY_NETWORK_STATE = 'SET_ADMIN_VISUALIZATION_DATASET_QUERY_NETWORK_STATE';

export interface AdminVisualizationAction {
    changed?: boolean;
    datasets?: Map<string, any[]>;
    datasetQueryRef?: VisualizationDatasetQueryRef;
    networkIdentity?: NetworkIdentity;
    page?: AdminVisualizationPage;
    pages?: AdminVisualizationPage[];
    dsState?: CohortStateType;
    type: string;
}

// Asynchronous
export const loadDependentDatasets = (page: VisualizationPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const deps: Set<VisualizationDatasetQueryRef> = new Set();
        const results: Map<string, PatientListDatasetDTO[]> = new Map();
        const errInfo: any[] = [];

        if (!state.admin) return;
        const viz = state.admin.visualizations;
        const responders: NetworkIdentity[] = [];

        /**
         * Get dependent datasets not yet loaded
         */
        for (const comp of page.components) {
            for (const dsref of comp.datasetQueryIds) {
                if (!viz.datasets.has(dsref.id) || viz.datasets.get(dsref.id).state !== CohortStateType.LOADED) {
                    deps.add(dsref);
                }
            }
        }

        /**
         * Get responders to query
         */
        state.responders.forEach((nr: NetworkIdentity) => { 
            const crt = state.cohort.networkCohorts.get(nr.id)!;
            if (nr.enabled && 
                (
                    (nr.isHomeNode && !nr.isGateway) || !nr.isHomeNode
                ) &&
                crt.count.state === CohortStateType.LOADED
            ) { 
                responders.push(nr); 
            } 
        });

        if (deps.size) {
            dispatch(setNoClickModalState({ message: "Loading Data", state: NotificationStates.Working }));

            // Foreach dataset
            Promise.all([ ...deps.values() ].map(dsref => {
                dispatch(setAdminVisualizationDatasetQueryState(dsref, CohortStateType.REQUESTING));
                results.set(dsref.id, []);

                // Foreach responder
                responders.map((nr, i) => { 
                    return new Promise( async (resolve, reject) => {
                        try {
                            if (nr.isHomeNode || dsref.universalId) {
                                const queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;
                                const ds = await fetchVisualizationDataset(state, nr, queryId, dsref);
                                results.set(dsref.id, results.get(dsref.id).concat(ds));
                                dispatch(setAdminVisualizationDatasetQueryNetworkState(dsref, CohortStateType.LOADED, nr));
                            } else {
                                dispatch(setAdminVisualizationDatasetQueryNetworkState(dsref, CohortStateType.NOT_IMPLEMENTED, nr));
                            }
                        } catch (err) {
                            dispatch(setAdminVisualizationDatasetQueryNetworkState(dsref, CohortStateType.IN_ERROR, nr));
                            errInfo.push([ dsref.name, nr.name, err ]);
                            console.log(err);
                        }
                        resolve(null);
                    });
                });
                dispatch(setAdminVisualizationDatasetQueryState(dsref, CohortStateType.LOADED));
                return null;
            }))
            .then( async () => {
                const atLeastOneSucceededCount = [ ...results.values() ].filter(dsarr => dsarr.length >= 1).length;

                // If at least one part of each requested dataset was successfully pulled
                if (atLeastOneSucceededCount === deps.size) {
                    const combined = await combineDatasets(results);
                    dispatch(setAdminVisualizationDatasets(combined));
                } else {
                    const info: InformationModalState = {
                        body: 
                            `Leaf encountered ${errInfo.length} error(s) when attempting to load dependent datasets:
                            ${errInfo.map(err => <p>{err.join(", ")}</p>)}`
                        ,
                        header: "Error Loading Datasets",
                        show: true
                    };
                    dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                    dispatch(showInfoModal(info));
                }
            });
            dispatch(setNoClickModalState({ state: NotificationStates.Complete }));
        }
    };
};

/*
 * Save or update a Visualization Page, depending on
 * if it is preexisting or new.
 */
export const saveAdminVisualizationPage = (page: AdminVisualizationPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));
            const newPage = page.unsaved
                ? await createAdminVisualiationPage(state, page)
                : await updateAdminVisualiationPage(state, page);

            dispatch(removeAdminVisualizationPage(page));
            dispatch(setAdminVisualizationPage(newPage, false));
        } catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "An error occurred while attempting to save the Visualization. Please see the Leaf error logs for details.",
                header: "Error Saving Visualization",
                show: true
            };
            dispatch(showInfoModal(info));
        } finally {
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
        }
    };
};

/*
 * Delete a VisualizationPage.
 */
export const deleteAdminVisualization = (page: AdminVisualizationPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NotificationStates.Working }));
            deleteAdminVisualizationPage(state, page)
                .then(
                    response => {
                        dispatch(removeAdminVisualizationPage(page));
                        dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Visualization Deleted' }));
                },  error => {
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Visualization. Please see the Leaf error logs for details.",
                            header: "Error Deleting Visualization",
                            show: true
                        };
                        dispatch(showInfoModal(info));
                });
        } catch (err) {
            console.log(err);
        } finally {
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
        }
    }
};

// Synchronous
export const setAdminVisualizationPage = (page: AdminVisualizationPage, changed: boolean): AdminVisualizationAction => {
    return {
        changed,
        page,
        type: SET_ADMIN_VISUALIZATION
    };
};

export const setAdminVisualizationPages = (pages: AdminVisualizationPage[]): AdminVisualizationAction => {
    return {
        pages,
        type: SET_ADMIN_VISUALIZATIONS
    };
};

export const removeAdminVisualizationPage = (page: AdminVisualizationPage): AdminVisualizationAction => {
    return {
        page,
        type: REMOVE_ADMIN_VISUALIZATION
    };
};

export const undoAdminVisualizationPageChange = (): AdminVisualizationAction => {
    return {
        type: UNDO_ADMIN_VISUALIZATION_CHANGE
    };
};

export const setAdminCurrentVisualizationPage = (page: AdminVisualizationPage): AdminVisualizationAction => {
    return {
        page,
        type: SET_ADMIN_VISUALIZATION_CURRENT
    };
};

export const setAdminVisualizationDatasets = (datasets: Map<string, any[]>): AdminVisualizationAction => {
    return {
        datasets,
        type: SET_ADMIN_VISUALIZATION_DATASETS
    };
};

export const setAdminVisualizationDatasetQueryState = (datasetQueryRef: VisualizationDatasetQueryRef, dsState: CohortStateType): AdminVisualizationAction => {
    return {
        datasetQueryRef,
        dsState,
        type: SET_ADMIN_VISUALIZATION_DATASET_QUERY_STATE
    };
};

export const setAdminVisualizationDatasetQueryNetworkState = (
    datasetQueryRef: VisualizationDatasetQueryRef, 
    dsState: CohortStateType, 
    networkIdentity: NetworkIdentity): AdminVisualizationAction => {

    return {
        datasetQueryRef,
        dsState,
        networkIdentity,
        type: SET_ADMIN_VISUALIZATION_DATASET_QUERY_NETWORK_STATE
    };
};