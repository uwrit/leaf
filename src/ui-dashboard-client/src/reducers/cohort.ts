/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { 
    CohortAction,
    SET_COHORT_DATASETS,
    SET_COHORT_STATE
} from '../actions/cohort';
import { CohortData, CohortState, CohortStateType } from '../models/state/CohortState';

export function defaultCohortState(): CohortState {
    return { 
        data: {
            metadata: new Map(),
            patients: new Map()
        },
        state: CohortStateType.NOT_LOADED
    };
}

const setCohortDatasets = (state: CohortState, data: CohortData) => {
    return Object.assign({}, state, { data });
};

const setCohortState = (state: CohortState, cohortStateType: CohortStateType) => {
    return Object.assign({}, state, { state: cohortStateType });
};

const clearCohortDatasets = (state: CohortState) => {
    return Object.assign({}, state, {
        ...state,
        cohort: {
            patients: new Map()
        }
    });
};

export function cohort(state: CohortState = defaultCohortState(), action: CohortAction): CohortState {
    switch (action.type) {
        case SET_COHORT_DATASETS:
            return setCohortDatasets(state, action.cohort!);
        case SET_COHORT_STATE:
            return setCohortState(state, action.state!);
        default:
            return state;
    }
}
