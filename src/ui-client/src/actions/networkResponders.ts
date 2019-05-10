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
import { NetworkIdentity } from '../models/NetworkResponder';
import { aggregateStatistics } from '../services/cohortAggregatorApi';
import { setAggregateVisualizationData } from './cohort/visualize';

export const SET_ResponderS = 'SET_ResponderS';
export const ERROR_Responder = 'ERROR_ResponderS';
export const ENABLE_Responder = 'ENABLE_Responder';
export const DISABLE_Responder = 'DISABLE_Responder';

export interface NetworkRespondersAction {
    responders?: NetworkIdentity[];
    responder?: NetworkIdentity;
    id?: number;
    error?: string;
    type: string;
}

// Asynchronous
/*
 * Handles a responder enable/disable click. If
 * a cohort visualization/patient list has been loaded,
 * the responder's patients are added/removed from the
 * aggregate accordingly.
 */
export const handleResponderToggle = (id: NetworkIdentity) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        
        // Toggle responder enabled status (this updates UI and recalculates total count)
        const responderUpdate = !id.enabled ? enableResponder : disableResponder;
        dispatch(responderUpdate(id.id));

        // Check if we need to reaggregate visualizations
        const state = getState();
        if (state.cohort.visualization.state === CohortStateType.LOADED) {
            const aggregate = await aggregateStatistics(state.cohort.networkCohorts, state.responders) as DemographicStatistics;
            dispatch(setAggregateVisualizationData(aggregate));
        }
    };
};

// Synchronous
export const enableResponder = (id: number): NetworkRespondersAction => {
    return {
        id,
        type: ENABLE_Responder
    };
};

export const disableResponder = (id: number): NetworkRespondersAction => {
    return {
        id,
        type: DISABLE_Responder
    };
};

export const setResponders = (responders: NetworkIdentity[]): NetworkRespondersAction => {
    return {
        responders,
        type: SET_ResponderS
    };
};

export const errorResponder = (id: number, error: string): NetworkRespondersAction => {
    return {
        error,
        id,
        type: ERROR_Responder
    };
};
