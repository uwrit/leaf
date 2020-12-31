/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { ConceptDatasetDTO } from '../../models/cohort/ConceptDataset';
import { Concept } from '../../models/concept/Concept';
import { NetworkIdentity } from '../../models/NetworkResponder';
import { AppState } from '../../models/state/AppState';
import { CohortStateType } from '../../models/state/CohortState';
import { InformationModalState } from '../../models/state/GeneralUiState';
import { TimelinesAggregateDataset } from '../../models/timelines/Data';
import { fetchConceptDataset, fetchPanelDataset } from '../../services/cohortApi';
import { addConceptDataset, getChartData } from '../../services/timelinesApi';
import { showInfoModal } from '../generalUi';

export const TIMELINES_SET_AGGREGATE_DATASET = 'TIMELINES_SET_AGGREGATE_DATASET';

export const TIMELINES_CONCEPT_DATASET_START = 'TIMELINES_CONCEPT_DATASET_START';
export const TIMELINES_CONCEPT_DATASET_FINISH = 'TIMELINES_CONCEPT_DATASET_FINISH';
export const TIMELINES_CONCEPT_DATASET_NETWORK_DATASET = 'TIMELINES_CONCEPT_DATASET_NETWORK_DATASET';
export const TIMELINES_CONCEPT_DATASET_NETWORK_ERROR = 'TIMELINES_CONCEPT_DATASET_NETWORK_ERROR';
export const TIMELINES_CONCEPT_DATASET_NETWORK_NOT_IMPLEMENTED = 'TIMELINES_CONCEPT_DATASET_NETWORK_NOT_IMPLEMENTED';

export const TIMELINES_INDEX_DATASET_START = 'TIMELINES_INDEX_DATASET_START';
export const TIMELINES_INDEX_DATASET_FINISH = 'TIMELINES_INDEX_DATASET_FINISH';
export const TIMELINES_INDEX_DATASET_NETWORK_DATASET = 'TIMELINES_INDEX_DATASET_NETWORK_DATASET';
export const TIMELINES_INDEX_DATASET_NETWORK_ERROR = 'TIMELINES_INDEX_DATASET_NETWORK_ERROR';
export const TIMELINES_INDEX_DATASET_NETWORK_NOT_IMPLEMENTED = 'TIMELINES_INDEX_DATASET_NETWORK_NOT_IMPLEMENTED';

export interface CohortTimelinesAction {
    aggregateDataset?: TimelinesAggregateDataset;
    concept?: Concept;
    data?: ConceptDatasetDTO;
    id?: number;
    type: string;
}

/**
 * Request timeline concept datasets from all enabled nodes, in parallel.
 * If a result comes back after query is cancelled, it is discarded.
 */
export const getConceptDataset = (concept: Concept) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        let atLeastOneSucceeded = false;
        const state = getState();
        const responders: NetworkIdentity[] = [];
        state.responders.forEach((nr: NetworkIdentity) => { 
            if (concept.universalId || nr.enabled) { 
                responders.push(nr); 
            } 
        });
        dispatch(setTimelinesConceptDatasetExtractStarted(concept));

        // Wrap entire query action in Promise.all
        Promise.all(
            // For each enabled responder
            responders.map((nr: NetworkIdentity, i: number) => { 
                return new Promise( async(resolve, reject) => {
                    let queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;

                    // Request concept dataset
                    fetchConceptDataset(getState(), nr, queryId, concept)
                        .then(
                            response => {
                                // Make sure query hasn't been cancelled
                                if (getState().cohort.timelines.stateByConcept.get(concept.id) !== CohortStateType.REQUESTING) { return; }

                                // Update state
                                const dto = response.data as ConceptDatasetDTO;

                                atLeastOneSucceeded = true;
                                dispatch(setTimelinesNetworkConceptDataset(nr.id, concept, dto));
                                
                        },  error => {
                            if (getState().cohort.timelines.stateByConcept.get(concept.id) !== CohortStateType.REQUESTING) { return; }

                            if (error.response && error.response.status === 400) {
                                dispatch(setTimelinesNetworkConceptDatasetNotImplemented(nr.id, concept))
                            } else {
                                dispatch(setTimelinesNetworkConceptDatasetError(nr.id, concept));
                            }
                        })
                        .then(() => resolve(null));
                });
            })
        ).then( async () => {
            if (getState().cohort.timelines.stateByConcept.get(concept.id) !== CohortStateType.REQUESTING) { return; }
            dispatch(setTimelinesConceptDatasetExtractFinished(concept));

            if (atLeastOneSucceeded) {
                const timeline = await getChartData(state.cohort.timelines.configuration) as TimelinesAggregateDataset;
                dispatch(setTimelinesAggregateDataset(timeline));
            } else {
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
        const responders: NetworkIdentity[] = [];
        state.responders.forEach((nr: NetworkIdentity) => { 
            if (nr.enabled) { 
                responders.push(nr); 
            } 
        });
        dispatch(setTimelinesIndexDatasetExtractStarted());

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
                                await addConceptDataset(dto, nr.id);

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

            if (atLeastOneSucceeded) {
                const timeline = await getChartData(state.cohort.timelines.configuration) as TimelinesAggregateDataset;
                dispatch(setTimelinesAggregateDataset(timeline));
            } else {
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

export const setTimelinesAggregateDataset = (aggregateDataset: TimelinesAggregateDataset): CohortTimelinesAction => {
    return {
        aggregateDataset,
        type: TIMELINES_SET_AGGREGATE_DATASET
    };
};

export const setTimelinesConceptDatasetExtractStarted = (concept: Concept): CohortTimelinesAction => {
    return {
        concept,
        type: TIMELINES_CONCEPT_DATASET_START
    };
};

export const setTimelinesConceptDatasetExtractFinished = (concept: Concept): CohortTimelinesAction => {
    return {
        concept,
        type: TIMELINES_CONCEPT_DATASET_FINISH
    };
};

export const setTimelinesNetworkConceptDataset = (id: number, concept: Concept, data: ConceptDatasetDTO): CohortTimelinesAction => {
    return {
        id,
        concept,
        data,
        type: TIMELINES_CONCEPT_DATASET_NETWORK_DATASET
    };
};

export const setTimelinesNetworkConceptDatasetNotImplemented = (id: number, concept: Concept): CohortTimelinesAction => {
    return {
        id,
        concept,
        type: TIMELINES_CONCEPT_DATASET_NETWORK_NOT_IMPLEMENTED
    };
};

export const setTimelinesNetworkConceptDatasetError = (id: number, concept: Concept): CohortTimelinesAction => {
    return {
        id,
        concept,
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