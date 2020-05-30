/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CohortCountAction } from '../../actions/cohort/count';
import { CohortState, NetworkCohortState, PatientCountState } from '../../models/state/CohortState';
import { CohortStateType } from '../../models/state/CohortState';
import { defaultPatientListState } from './patientList';
import { defaultVisualizationState } from './visualize';

export const defaultCountState = (): PatientCountState => {
    return {
        queryId: '',
        plusMinus: 0,
        sqlStatements: [],
        state: CohortStateType.NOT_LOADED,
        value: 0,
        withinLowCellThreshold: false
    };
};

export const errorCohortCount = (state: CohortState, action: CohortCountAction): CohortState => {
    return setCohortCountState(state, action, CohortStateType.IN_ERROR)
};

export const cohortCountNotImplemented = (state: CohortState, action: CohortCountAction): CohortState => {
    return setCohortCountState(state, action, CohortStateType.NOT_IMPLEMENTED)
};

const setCohortCountState = (state: CohortState, action: CohortCountAction, type: CohortStateType): CohortState => {
    const network = new Map(state.networkCohorts);
    const clone = Object.assign({}, network.get(action.id)!, {
        count: {
            ...defaultCountState(),
            state: type
        },
        patientList: {
            ...defaultPatientListState(),
            state: type
        },
        visualization: {
            ...defaultVisualizationState(),
            state: type
        }
    });
    network.set(clone.id, clone); 

    return Object.assign({}, state, {
        networkCohorts: network
    }) as CohortState;
};

export const recalculateCohortCount = (state: CohortState, id: number, enabled: boolean): CohortState => {
    const networkCohortCount = state.networkCohorts.get(id)!.count.value;
    const aggCount = state.count.value;
    const newAggCount = enabled 
        ? aggCount + networkCohortCount
        : aggCount - networkCohortCount;
    return Object.assign({}, state, {
        count: {
            ...state.count,
            value: newAggCount,
        }
    });
};

export const setNetworkCohortCount = (state: CohortState, action: CohortCountAction): CohortState => {

    // Update count for this network responder
    let totalPatients = 0;
    let totalPlusMinus = 0;
    let withinLowCellThreshold = false;
    const cohort = state.networkCohorts.get(action.id!)
    const networkCohort: NetworkCohortState = Object.assign({}, cohort, {
        count: {
            ...action.countResults,
            state: CohortStateType.LOADED
        },
        patientList: {
            ...defaultPatientListState(),
            state: CohortStateType.NOT_LOADED
        },
        visualization: {
            ...defaultVisualizationState(),
            state: CohortStateType.NOT_LOADED
        },
    });

    const network = new Map(state.networkCohorts)

    // Aggregate
    let numWithinLowCellThreshold = 0;
        let included = 0;
        network.set(action.id!, networkCohort);
        network.forEach((nc: NetworkCohortState) => { 
            if (nc.count.state === CohortStateType.LOADED || nc.count.state === CohortStateType.IN_ERROR) {
                totalPatients += nc.count.value;
                totalPlusMinus += nc.count.plusMinus;
                included += 1;

                if (nc.count.withinLowCellThreshold) {
                    numWithinLowCellThreshold += 1;
                }
            }
        });
        withinLowCellThreshold = numWithinLowCellThreshold === included;

    // Return new aggregate cohort state
    return Object.assign({}, state, {
        count: {
            ...state.count,
            plusMinus: totalPlusMinus,
            value: totalPatients,
            withinLowCellThreshold: withinLowCellThreshold
        },
        networkCohorts: network
    });
};