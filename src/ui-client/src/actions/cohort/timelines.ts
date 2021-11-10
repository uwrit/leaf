/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { ConceptDatasetDTO } from '../../models/cohort/ConceptDataset';
import { NetworkIdentity } from '../../models/NetworkResponder';
import { Panel, panelToDto } from '../../models/panel/Panel';
import { AppState } from '../../models/state/AppState';
import { CohortStateType } from '../../models/state/CohortState';
import { InformationModalState, NotificationStates } from '../../models/state/GeneralUiState';
import { TimelinesConfiguration } from '../../models/timelines/Configuration';
import { TimelinesAggregateDataset } from '../../models/timelines/Data';
import { fetchConceptDataset, fetchPanelDataset } from '../../services/cohortApi';
import { addConceptDataset, addIndexDataset, getChartData, removeConceptDataset } from '../../services/timelinesApi';
import { setNoClickModalState, showInfoModal } from '../generalUi';

export const TIMELINES_SET_AGGREGATE_DATASET = 'TIMELINES_SET_AGGREGATE_DATASET';
export const TIMELINES_SET_CONFIG = 'TIMELINES_SET_CONFIG';
export const TIMELINES_REMOVE_CONCEPT_DATASET = 'TIMELINES_REMOVE_CONCEPT_DATASET';

export const TIMELINES_CONCEPT_DATASET_START = 'TIMELINES_CONCEPT_DATASET_START';
export const TIMELINES_CONCEPT_DATASET_FINISH = 'TIMELINES_CONCEPT_DATASET_FINISH';
export const TIMELINES_CONCEPT_DATASET_NETWORK_DATASET = 'TIMELINES_CONCEPT_DATASET_NETWORK_DATASET';
export const TIMELINES_CONCEPT_DATASET_NETWORK_ERROR = 'TIMELINES_CONCEPT_DATASET_NETWORK_ERROR';
export const TIMELINES_CONCEPT_DATASET_NETWORK_NOT_IMPLEMENTED = 'TIMELINES_CONCEPT_DATASET_NETWORK_NOT_IMPLEMENTED';

export const TIMELINES_INDEX_SET_PANEL_ID = 'TIMELINES_INDEX_SET_PANEL_ID';
export const TIMELINES_INDEX_DATASET_START = 'TIMELINES_INDEX_DATASET_START';
export const TIMELINES_INDEX_DATASET_FINISH = 'TIMELINES_INDEX_DATASET_FINISH';
export const TIMELINES_INDEX_DATASET_NETWORK_DATASET = 'TIMELINES_INDEX_DATASET_NETWORK_DATASET';
export const TIMELINES_INDEX_DATASET_NETWORK_ERROR = 'TIMELINES_INDEX_DATASET_NETWORK_ERROR';
export const TIMELINES_INDEX_DATASET_NETWORK_NOT_IMPLEMENTED = 'TIMELINES_INDEX_DATASET_NETWORK_NOT_IMPLEMENTED';

export interface CohortTimelinesAction {
    aggregateDataset?: TimelinesAggregateDataset;
    config?: TimelinesConfiguration;
    data?: ConceptDatasetDTO | null;
    id?: number;
    indexPanel?: number;
    panel?: Panel;
    type: string;
}

/**
 * Request timeline concept datasets from all enabled nodes, in parallel.
 * If a result comes back after query is cancelled, it is discarded.
 */
export const getConceptDataset = (panel: Panel) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        let atLeastOneSucceeded = false;
        const state = getState();
        const dto = panelToDto(panel);
        const concept = panel.subPanels[0].panelItems[0].concept;
        const timelines = state.cohort.timelines;
        const responders: NetworkIdentity[] = [];
        state.responders.forEach((nr: NetworkIdentity) => { 
            if (concept.universalId || nr.enabled) { 
                responders.push(nr); 
            } 
        });
        dispatch(setTimelinesConceptDatasetExtractStarted(panel));

        // Wrap entire query action in Promise.all
        Promise.all(
            // For each enabled responder
            responders.map((nr) => { 
                return new Promise( async(resolve, reject) => {
                    let queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;

                    // Request concept dataset
                    fetchConceptDataset(getState(), nr, queryId, dto)
                        .then( async response => {
                                // Make sure query hasn't been cancelled
                                if (getState().cohort.timelines.state !== CohortStateType.REQUESTING) { return; }

                                // Update state
                                const dto = response.data as ConceptDatasetDTO;
                                await addConceptDataset(dto, nr.id, panel);

                                atLeastOneSucceeded = true;
                                dispatch(setTimelinesNetworkConceptDataset(nr.id, panel, dto));
                                
                        },  error => {
                            if (getState().cohort.timelines.state !== CohortStateType.REQUESTING) { return; }

                            if (error.response && error.response.status === 400) {
                                dispatch(setTimelinesNetworkConceptDatasetNotImplemented(nr.id, panel))
                            } else {
                                dispatch(setTimelinesNetworkConceptDatasetError(nr.id, panel));
                            }
                        })
                        .then(() => resolve(null));
                });
            })
        ).then( async () => {
            if (getState().cohort.timelines.state !== CohortStateType.REQUESTING) { return; }
            dispatch(setTimelinesConceptDatasetExtractFinished(panel));

            if (atLeastOneSucceeded && timelines.indexConceptState) {
                const newConfig = Object.assign({}, timelines.configuration);
                newConfig.panels = new Map(newConfig.panels);
                newConfig.panels.set(concept.id, panel);
                const timeline = await getChartData(newConfig) as TimelinesAggregateDataset;
                dispatch(setTimelinesConfiguration(newConfig));
                dispatch(setTimelinesAggregateDataset(timeline));

            } else if (!atLeastOneSucceeded) {
                const info : InformationModalState = {
                    header: "Error Running Query",
                    body: "Leaf encountered an error while extracting the data. If this continues, please contact your Leaf administrator.",
                    show: true
                }
                dispatch(showInfoModal(info));
            }
        });
    };
};

/**
 * Request timeline panel datasets from all enabled nodes, in parallel.
 * If a result comes back after query is cancelled, it is discarded.
 */
export const getPanelIndexDataset = (panelIdx: number) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        let atLeastOneSucceeded = false;
        const state = getState();
        const timelines = state.cohort.timelines;
        const responders: NetworkIdentity[] = [];
        state.responders.forEach((nr: NetworkIdentity) => { 
            if (nr.enabled) { 
                responders.push(nr); 
            } 
        });
        dispatch(setTimelinesIndexDatasetExtractStarted());
        dispatch(setNoClickModalState({ message: "Extracting", state: NotificationStates.Working }));

        // Wrap entire query action in Promise.all
        Promise.all(
            // For each enabled responder
            responders.map((nr: NetworkIdentity, i: number) => { 
                return new Promise( async(resolve, reject) => {
                    let queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;

                    // Request concept dataset
                    fetchPanelDataset(getState(), nr, queryId, panelIdx)
                        .then( async response => {
                                // Make sure query hasn't been cancelled
                                if (getState().cohort.timelines.indexConceptState !== CohortStateType.REQUESTING) { return; }

                                // Send to web worker
                                const dto = response.data as ConceptDatasetDTO;
                                await addIndexDataset(dto, nr.id);

                                atLeastOneSucceeded = true;
                                dispatch(setTimelinesNetworkIndexDataset(nr.id));
                                
                        },  error => {
                            if (getState().cohort.timelines.indexConceptState !== CohortStateType.REQUESTING) { return; }

                            if (error.response && error.response.status === 400) {
                                dispatch(setTimelinesNetworkIndexDatasetNotImplemented(nr.id))
                            } else {
                                dispatch(setTimelinesNetworkIndexDatasetError(nr.id));
                            }
                        })
                        .then(() => resolve(null));
                });
            })
        ).then( async () => {
            if (getState().cohort.timelines.indexConceptState !== CohortStateType.REQUESTING) { return; }
            dispatch(setTimelinesIndexDatasetExtractFinished());
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));

            if (atLeastOneSucceeded && timelines.aggregateData.concepts.size > 0) {
                const timeline = await getChartData(timelines.configuration) as TimelinesAggregateDataset;
                dispatch(setTimelinesAggregateDataset(timeline));

            } else if (!atLeastOneSucceeded) {
                const info : InformationModalState = {
                    header: "Error Running Query",
                    body: "Leaf encountered an error while extracting the data. If this continues, please contact your Leaf administrator.",
                    show: true
                }
                dispatch(showInfoModal(info));
            }
        });
    };
};

export const deleteConceptDataset = (panel: Panel) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        dispatch(deleteTimelinesConceptDataset(panel));
        const timelines = getState().cohort.timelines;
        const concept = panel.subPanels[0].panelItems[0].concept;
        const config = timelines.configuration;
        config.panels.delete(concept.id);
        await removeConceptDataset(config, panel);

        const timeline = await getChartData(config) as TimelinesAggregateDataset;
        dispatch(setTimelinesConfiguration(timelines.configuration));
        dispatch(setTimelinesAggregateDataset(timeline));
    };
}

export const getLatestTimelinesDataFromConfig = (config: TimelinesConfiguration) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        if (state.cohort.timelines.indexConceptState) {
            const timeline = await getChartData(config) as TimelinesAggregateDataset;
            dispatch(setTimelinesAggregateDataset(timeline));
        }
    };
};

// Synchronous
export const deleteTimelinesConceptDataset = (panel: Panel): CohortTimelinesAction => {
    return {
        panel,
        type: TIMELINES_REMOVE_CONCEPT_DATASET
    };
};

export const setTimelinesIndexPanelId = (indexPanel: number): CohortTimelinesAction => {
    return {
        indexPanel,
        type: TIMELINES_INDEX_SET_PANEL_ID
    };
};

export const setTimelinesConfiguration = (config: TimelinesConfiguration): CohortTimelinesAction => {
    return {
        config,
        type: TIMELINES_SET_CONFIG
    };
};

export const setTimelinesAggregateDataset = (aggregateDataset: TimelinesAggregateDataset): CohortTimelinesAction => {
    return {
        aggregateDataset,
        type: TIMELINES_SET_AGGREGATE_DATASET
    };
};

export const setTimelinesConceptDatasetExtractStarted = (panel: Panel): CohortTimelinesAction => {
    return {
        panel,
        type: TIMELINES_CONCEPT_DATASET_START
    };
};

export const setTimelinesConceptDatasetExtractFinished = (panel: Panel): CohortTimelinesAction => {
    return {
        panel,
        type: TIMELINES_CONCEPT_DATASET_FINISH
    };
};

export const setTimelinesNetworkConceptDataset = (id: number, panel: Panel, data: ConceptDatasetDTO): CohortTimelinesAction => {
    return {
        id,
        panel,
        data,
        type: TIMELINES_CONCEPT_DATASET_NETWORK_DATASET
    };
};

export const setTimelinesNetworkConceptDatasetNotImplemented = (id: number, panel: Panel): CohortTimelinesAction => {
    return {
        id,
        panel,
        type: TIMELINES_CONCEPT_DATASET_NETWORK_NOT_IMPLEMENTED
    };
};

export const setTimelinesNetworkConceptDatasetError = (id: number, panel: Panel): CohortTimelinesAction => {
    return {
        id,
        panel,
        type: TIMELINES_CONCEPT_DATASET_NETWORK_ERROR
    };
};

export const setTimelinesIndexDatasetExtractStarted = (): CohortTimelinesAction => {
    return {
        type: TIMELINES_INDEX_DATASET_START
    };
};

export const setTimelinesIndexDatasetExtractFinished = (): CohortTimelinesAction => {
    return {
        type: TIMELINES_INDEX_DATASET_FINISH
    };
};

export const setTimelinesNetworkIndexDataset = (id: number): CohortTimelinesAction => {
    return {
        id,
        type: TIMELINES_INDEX_DATASET_NETWORK_DATASET
    };
};

export const setTimelinesNetworkIndexDatasetNotImplemented = (id: number): CohortTimelinesAction => {
    return {
        id,
        type: TIMELINES_INDEX_DATASET_NETWORK_NOT_IMPLEMENTED
    };
};

export const setTimelinesNetworkIndexDatasetError = (id: number): CohortTimelinesAction => {
    return {
        id,
        type: TIMELINES_INDEX_DATASET_NETWORK_ERROR
    };
};