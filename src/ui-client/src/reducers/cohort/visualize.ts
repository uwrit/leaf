/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CohortVisualizationAction } from '../../actions/cohort/visualize';
import { CohortState, NetworkCohortState, VisualizationState } from '../../models/state/CohortState';
import { CohortStateType } from '../../models/state/CohortState';

export const defaultVisualizationState = (): VisualizationState => {
    return {
        datasets: new Map(),
        demographics: {
            ageByGenderData: {
                buckets: {
                    '1-9': { females: 0, males: 0, others: 0 },
                    '10-17': { females: 0, males: 0, others: 0 },
                    '18-24': { females: 0, males: 0, others: 0 },
                    '25-34': { females: 0, males: 0, others: 0 },
                    '35-44': { females: 0, males: 0, others: 0 },
                    '45-54': { females: 0, males: 0, others: 0 },
                    '55-64': { females: 0, males: 0, others: 0 },
                    '65-74': { females: 0, males: 0, others: 0 },
                    '75-84': { females: 0, males: 0, others: 0 },
                    '<1': { females: 0, males: 0, others: 0 },
                    '>84': { females: 0, males: 0, others: 0 }
                }
            },
            binarySplitData: [],
            languageByHeritageData: {
                data: {
                    buckets: {}
                },
                subBucketTotals: {}
            },
            religionData: {},
            nihRaceEthnicityData: {
                ethnicBackgrounds: {}
            }
        },
        state: CohortStateType.NOT_LOADED
    };
};

export const resetVisualizationState = (state: CohortState): CohortState => {
    const network = new Map(state.networkCohorts);
    network.forEach((n: NetworkCohortState) => { 
        n.visualization = defaultVisualizationState();
        network.set(n.id, n); 
    });

    const newState: CohortState = Object.assign({}, state, {
        ...state,
        visualization: defaultVisualizationState()
    });
    return newState;
};

export const setNetworkCohortVisualization = (state: CohortState, action: CohortVisualizationAction): CohortState => {
    const ref = state.networkCohorts.get(action.id) as NetworkCohortState;
    const networkCohort: NetworkCohortState = Object.assign({}, ref, {
        patientList: {
            ...ref.patientList
        },
        timelines: {
            ...ref.timelines,
        },
        visualization: {
            demographics: action.vizResults!,
            state: CohortStateType.LOADED
        } 
    });

    const network = new Map(state.networkCohorts).set(action.id, networkCohort);
    return Object.assign({}, state, {
        ...state,
        networkCohorts: network,
    });
};

export const setAggregateCohortVisualization = (state: CohortState, action: CohortVisualizationAction): CohortState => {
    return Object.assign({}, state, {
        visualization: {
            ...state.visualization,
            demographics: action.vizResults!,
            state: CohortStateType.LOADED
        }
    });
};

export const setVisualizationDatasetState = (state: CohortState, action: CohortVisualizationAction): CohortState => {
    const datasets = new Map(state.visualization.datasets);
    action.vizDatasets.forEach((rows, dsid) => {
        const ds = datasets.has(dsid)
            ? Object.assign({}, datasets.get(dsid))
            : { id: dsid, state: action.dsState, networkState: new Map(), data: [] as any[] };
        ds.data = rows;
        datasets.set(dsid, ds);
    });

    return Object.assign({}, state, { 
        visualization: {
            ...state.visualization,
            datasets
        }
    });
};

export const setVisualizationDatasetQueryState = (state: CohortState, action: CohortVisualizationAction): CohortState => {
    const datasets = new Map(state.visualization.datasets);
    const newds = datasets.has(action.datasetQueryRef.id)
        ? Object.assign({}, datasets.get(action.datasetQueryRef.id))
        : { id: action.datasetQueryRef.id, state: action.dsState, networkState: new Map(), data: [] as any[] };
    newds.state = action.dsState;
    datasets.set(newds.id, newds);

    return Object.assign({}, state, { 
        visualization: {
            ...state.visualization,
            datasets
        }
    });
};

export const setVisualizationDatasetQueryNetworkState = (state: CohortState, action: CohortVisualizationAction): CohortState => {
    const datasets = new Map(state.visualization.datasets);
    const newds = datasets.has(action.datasetQueryRef.id)
        ? Object.assign({}, datasets.get(action.datasetQueryRef.id))
        : { id: action.datasetQueryRef.id, state: action.dsState, networkState: new Map(), data: [] as any[] };
    newds.networkState.set(action.id, action.dsState);
    datasets.set(newds.id, newds);

    return Object.assign({}, state, { 
        visualization: {
            ...state.visualization,
            datasets
        }
    });
};