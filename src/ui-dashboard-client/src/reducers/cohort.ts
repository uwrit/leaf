/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { 
    CohortAction,
    SET_COHORT_DATASET
} from '../actions/cohort';
import { PatientListDatasetDTO } from '../models/patientList/Dataset';
import { CohortState } from '../models/state/CohortState';

export function defaultCohortState(): CohortState {
    return { 
        cohort: {
            data: new Map()
        },
        patient: {
            data: new Map()
        }
    };
}

const setCohortDataset = (state: CohortState, id: string, data: PatientListDatasetDTO) => {
    const cohortData = new Map(state.cohort.data);
    cohortData.set(id, { id, data: data.results })

    return Object.assign({}, state, {
        ...state,
        cohort: {
            data: cohortData
        }
    });
}

const clearCohortDatasets = (state: CohortState) => {
    return Object.assign({}, state, {
        ...state,
        cohort: {
            data: new Map()
        }
    });
}

export function cohort(state: CohortState = defaultCohortState(), action: CohortAction): CohortState {
    switch (action.type) {
        case SET_COHORT_DATASET:
            return setCohortDataset(state, action.id!, action.data!);
        default:
            return state;
    }
}
