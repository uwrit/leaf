/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { DemographicStatistics } from '../../models/cohort/Demographic';
import { NetworkIdentity } from '../../models/NetworkResponder';
import { PatientListDatasetDTO } from '../../models/patientList/Dataset';
import { AppState } from '../../models/state/AppState';
import { CohortStateType } from '../../models/state/CohortState';
import { InformationModalState, NotificationStates } from '../../models/state/GeneralUiState';
import { VisualizationDatasetQueryRef, VisualizationPage } from '../../models/visualization/Visualization';
import { combineDatasets } from '../../services/cohortAggregatorApi';
import { fetchVisualizationDataset } from '../../services/visualizationApi';
import { setCurrentVisualizationPage, setNoClickModalState, showInfoModal } from '../generalUi';

// Cohort visualize actions
export const VISUALIZATION_REQUEST = 'REQUEST_VISUALIZATION_DATA';
export const VISUALIZATION_SET_NETWORK = 'VISUALIZATION_SET_NETWORK';
export const VISUALIZATION_SET_AGGREGATE = 'VISUALIZATION_SET_AGGREGATE';
export const VISUALIZATION_SET_DATASETS = 'VISUALIZATION_SET_DATASETS';
export const VISUALIZATION_SET_DATASET_QUERY_STATE = 'VISUALIZATION_SET_DATASET_QUERY_STATE';
export const VISUALIZATION_SET_DATASET_QUERY_NETWORK_STATE = 'VISUALIZATION_SET_DATASET_QUERY_NETWORK_STATE';


export interface CohortVisualizationAction {
    id?: number;
    vizDatasets?: Map<string, any[]>;
    dsState?: CohortStateType;
    vizResults?: DemographicStatistics;
    error?: string;
    datasetQueryRef?: VisualizationDatasetQueryRef;
    type: string;
}

// Asynchonous
export const setCurrentVisualizationPageWithDatasetCheck = (page: VisualizationPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        if (getState().cohort.count.state === CohortStateType.LOADED) {
            dispatch(loadDependentDatasets(page));
        }
        dispatch(setCurrentVisualizationPage(page.id));
    };
};

export const loadDependentDatasets = (page: VisualizationPage) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const deps: Set<VisualizationDatasetQueryRef> = new Set();
        const results: Map<string, PatientListDatasetDTO[]> = new Map();
        const errInfo: any[] = [];
        const viz = state.cohort.visualization;
        const responders: NetworkIdentity[] = [];

        /**
         * Get dependent datasets not yet loaded
         */
        for (const comp of page.components) {
            for (const dsref of comp.datasetQueryRefs) {
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
            if (nr.enabled && ((nr.isHomeNode && !nr.isGateway) || !nr.isHomeNode) && crt.count.state === CohortStateType.LOADED) { 
                responders.push(nr); 
            } 
        });

        if (deps.size) {

            // Foreach dataset
            Promise.all([ ...deps.values() ].map(dsref => {
                return new Promise( async (resolveDataset, rejectDataset) => {
                    dispatch(setVisualizationDatasetQueryState(dsref, CohortStateType.REQUESTING));
                    results.set(dsref.id, []);

                    // Foreach responder
                    Promise.all(responders.map((nr, i) => { 
                        return new Promise( async (resolve, reject) => {
                            if (nr.isHomeNode || dsref.universalId) {
                                const queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;
                                fetchVisualizationDataset(state, nr, queryId, dsref)
                                    .then(ds => {
                                        results.set(dsref.id, results.get(dsref.id).concat(ds));
                                        dispatch(setVisualizationDatasetQueryNetworkState(dsref, CohortStateType.LOADED, nr.id));
                                    })
                                    .catch(err => {
                                        dispatch(setVisualizationDatasetQueryNetworkState(dsref, CohortStateType.IN_ERROR, nr.id));
                                        errInfo.push([ dsref.name, nr.name, err ]);
                                        console.log(err);
                                    })
                                    .finally(() => {
                                        resolve(null);
                                    });
                            } else {
                                dispatch(setVisualizationDatasetQueryNetworkState(dsref, CohortStateType.NOT_IMPLEMENTED, nr.id));
                                resolve(null);
                            }
                        });
                    }))
                    .then(() => { 
                        dispatch(setVisualizationDatasetQueryState(dsref, CohortStateType.LOADED));
                        resolveDataset(null);
                    });
                });
            }))
            .then( async () => {
                const atLeastOneSucceededCount = [ ...results.values() ].filter(dsarr => dsarr.length >= 1).length;

                // If at least one part of each requested dataset was successfully pulled
                if (atLeastOneSucceededCount === deps.size) {
                    const combined = await combineDatasets(results) as Map<string, any[]>;
                    dispatch(setVisualizationDatasets(combined));
                } else {
                    const info: InformationModalState = {
                        body: "Leaf encountered an error while loading data for the visualization. We are sorry for the inconvenience.",
                        header: "Error Loading Visualization Data",
                        show: true
                    };
                    dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                    dispatch(showInfoModal(info));
                }
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            });
        }
    };
};

// Synchronous
export const setNetworkVisualizationData = (id: number, vizResults: DemographicStatistics): CohortVisualizationAction => {
    return {
        id,
        type: VISUALIZATION_SET_NETWORK,
        vizResults
    };
};

export const setAggregateVisualizationData = (vizResults: DemographicStatistics): CohortVisualizationAction => {
    return {
        id: 0,
        type: VISUALIZATION_SET_AGGREGATE,
        vizResults
    };
};

export const setVisualizationDatasets = (vizDatasets: Map<string, any[]>): CohortVisualizationAction => {
    return {
        vizDatasets,
        type: VISUALIZATION_SET_DATASETS
    };
};

export const setVisualizationDatasetQueryState = (datasetQueryRef: VisualizationDatasetQueryRef, dsState: CohortStateType): CohortVisualizationAction => {
    return {
        datasetQueryRef,
        dsState,
        type: VISUALIZATION_SET_DATASET_QUERY_STATE
    };
};

export const setVisualizationDatasetQueryNetworkState = (
    datasetQueryRef: VisualizationDatasetQueryRef, 
    dsState: CohortStateType, 
    id: number): CohortVisualizationAction => {

    return {
        datasetQueryRef,
        dsState,
        id,
        type: VISUALIZATION_SET_DATASET_QUERY_NETWORK_STATE
    };
};