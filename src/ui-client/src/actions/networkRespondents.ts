/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { CohortStateType } from '../models/state/CohortState';
import { DemographicStatistics } from '../models/cohort/DemographicDTO';
import { NetworkIdentity } from '../models/NetworkRespondent';
import { aggregateStatistics } from '../services/cohortAggregatorApi';
import { setAggregateVisualizationData } from './cohort/visualize';

export const SET_RESPONDENTS = 'SET_RESPONDENTS';
export const ERROR_RESPONDENT = 'ERROR_RESPONDENTS';
export const ENABLE_RESPONDENT = 'ENABLE_RESPONDENT';
export const DISABLE_RESPONDENT = 'DISABLE_RESPONDENT';

export interface NetworkRespondentsAction {
    respondents?: NetworkIdentity[];
    respondent?: NetworkIdentity;
    id?: number;
    error?: string;
    type: string;
}

// Asynchronous
/*
 * Handles a respondent enable/disable click. If
 * a cohort visualization/patient list has been loaded,
 * the respondent's patients are added/removed from the
 * aggregate accordingly.
 */
export const handleRespondentToggle = (id: NetworkIdentity) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        
        // Toggle respondent enabled status (this updates UI and recalculates total count)
        const respondentUpdate = !id.enabled ? enableRespondent : disableRespondent;
        dispatch(respondentUpdate(id.id));

        // Check if we need to reaggregate visualizations
        const state = getState();
        if (state.cohort.visualization.state === CohortStateType.LOADED) {
            const aggregate = await aggregateStatistics(state.cohort.networkCohorts, state.respondents) as DemographicStatistics;
            dispatch(setAggregateVisualizationData(aggregate));
        }
    };
};

// Synchronous
export const enableRespondent = (id: number): NetworkRespondentsAction => {
    return {
        id,
        type: ENABLE_RESPONDENT
    };
};

export const disableRespondent = (id: number): NetworkRespondentsAction => {
    return {
        id,
        type: DISABLE_RESPONDENT
    };
};

export const setRespondents = (respondents: NetworkIdentity[]): NetworkRespondentsAction => {
    return {
        respondents,
        type: SET_RESPONDENTS
    };
};

export const errorRespondent = (id: number, error: string): NetworkRespondentsAction => {
    return {
        error,
        id,
        type: ERROR_RESPONDENT
    };
};
