/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { AuthConfig, UserContext } from '../models/Auth';
import { getAuthConfig, getUserTokenAndContext } from '../services/authApi';
import { attemptLoginRetryIfPossible } from '../services/sessionApi';
import { setRouteConfig } from './generalUi';
import { getRoutes } from '../config/routes';

export const REQUEST_ID_TOKEN = 'REQUEST_ID_TOKEN';
export const RECEIVE_ID_TOKEN = 'RECEIVE_ID_TOKEN';
export const FAILURE_ID_TOKEN = 'FAILURE_ID_TOKEN';
export const RECEIVE_AUTH_CONFIG = 'RECEIVE_AUTH_CONFIG';

export interface AuthorizationAction {
    config?: AuthConfig;
    message?: string;
    context?: UserContext;
    type: string;
}

// Asynchronous
export const getIdToken = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        // Get authorization config and version
        getAuthConfig()
            .then(
                config => {
                    dispatch(receiveAuthConfig(config));
                // Get user id token
                getUserTokenAndContext(config)
                .then((token) => {
                    dispatch(setRouteConfig(getRoutes(config, token)));
                    dispatch(receiveIdToken(token));
                })
                .catch((reason) => {
                    attemptLoginRetryIfPossible();
                    console.log(reason);
                    const message = "Hmm... The Leaf server doesn't seem to be responding. Please contact your Leaf administrator.";
                    dispatch(failureIdToken(message));
                });
        }, error => {
            attemptLoginRetryIfPossible();
            console.log(error);
            const message = "Hmm... The Leaf server doesn't seem to be responding. Please contact your Leaf administrator.";
            dispatch(failureIdToken(message));
        });
    };
};

// Synchronous
export const receiveAuthConfig = (config: AuthConfig): AuthorizationAction => {
    return {
        config,
        type: RECEIVE_AUTH_CONFIG
    };
};

export const receiveIdToken = (context: UserContext): AuthorizationAction => {
    return {
        context,
        type: RECEIVE_ID_TOKEN
    };
};

export const failureIdToken = (message: string): AuthorizationAction => {
    return {
        message,
        type: FAILURE_ID_TOKEN
    };
};
