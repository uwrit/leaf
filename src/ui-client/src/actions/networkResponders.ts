/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { CohortStateType } from '../models/state/CohortState';
import { DemographicStatistics } from '../models/cohort/Demographic';
import { NetworkIdentity } from '../models/NetworkResponder';
import { aggregateStatistics } from '../services/cohortAggregatorApi';
import { setAggregateVisualizationData } from './cohort/visualize';

export const SET_RESPONDERS = 'SET_RESPONDERS';
export const ERROR_RESPONDER = 'ERROR_RESPONDER';
export const ENABLE_RESPONDER = 'ENABLE_RESPONDER';
export const DISABLE_RESPONDER = 'DISABLE_RESPONDER';

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
        type: ENABLE_RESPONDER
    };
};

export const disableResponder = (id: number): NetworkRespondersAction => {
    return {
        id,
        type: DISABLE_RESPONDER
    };
};

export const setResponder = (responder: NetworkIdentity): NetworkRespondersAction => {
    return {
        responders: [ responder ],
        type: SET_RESPONDERS
    };
};

export const setResponders = (responders: NetworkIdentity[]): NetworkRespondersAction => {
    return {
        responders,
        type: SET_RESPONDERS
    };
};

export const errorResponder = (id: number, error: string): NetworkRespondersAction => {
    return {
        error,
        id,
        type: ERROR_RESPONDER
    };
};
