/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
        sqlStatements: [],
        state: CohortStateType.NOT_LOADED,
        value: 0
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
    let totalPatients: number = 0;
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

    // Compute aggregate results 
    const network = new Map(state.networkCohorts)
    network.set(action.id!, networkCohort);
    network.forEach((nc: NetworkCohortState) => { 
        if (nc.count.state === CohortStateType.LOADED || nc.count.state === CohortStateType.IN_ERROR) {
            totalPatients += nc.count.value;
        }
    });

    // Return new aggregate cohort state
    return Object.assign({}, state, {
        count: {
            ...state.count,
            value: totalPatients,
        },
        networkCohorts: network
    });
};