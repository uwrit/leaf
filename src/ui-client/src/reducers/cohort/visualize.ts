/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
                ethnicBackgrounds: {},
                total: 0
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
        visualization: defaultVisualizationState
    });
    return newState;
};

export const setNetworkCohortVisualization = (state: CohortState, action: CohortVisualizationAction): CohortState => {
    const ref = state.networkCohorts.get(action.id) as NetworkCohortState;
    const networkCohort: NetworkCohortState = Object.assign({}, ref, {
        patientList: {
            ...ref.patientList
        },
        visualization: {
            demographics: action.vizResults!,
            state: CohortStateType.LOADED
        } 
    });

    const network = new Map(state.networkCohorts).set(action.id, networkCohort);
    return Object.assign({}, state, {
        networkCohorts: network,
    }) as CohortState;
};

export const setAggregateCohortVisualization = (state: CohortState, action: CohortVisualizationAction): CohortState => {
    return Object.assign({}, state, {
        visualization: {
            demographics: action.vizResults!,
            state: CohortStateType.LOADED
        }
    }) as CohortState;
};