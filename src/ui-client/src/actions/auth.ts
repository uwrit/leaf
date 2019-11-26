/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { AppConfig, UserContext } from '../models/Auth';
import { getAuthConfig, getUserTokenAndContext } from '../services/authApi';
import { attemptLoginRetryIfPossible, removeSessionRetryKey } from '../services/sessionApi';
import { setRouteConfig } from './generalUi';
import { getRoutes } from '../config/routes';
import { setSessionLoadState } from './session';

export const REQUEST_ID_TOKEN = 'REQUEST_ID_TOKEN';
export const RECEIVE_ID_TOKEN = 'RECEIVE_ID_TOKEN';
export const FAILURE_ID_TOKEN = 'FAILURE_ID_TOKEN';
export const RECEIVE_AUTH_CONFIG = 'RECEIVE_AUTH_CONFIG';

export interface AuthorizationAction {
    config?: AppConfig;
    message?: string;
    context?: UserContext;
    type: string;
}

// Asynchronous
export const getIdToken = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {

        const notFoundMessage = "Hmm... No Leaf server was found. Please notify your Leaf administrator.";
        const failMessage = "The Leaf server was found but unexpectedly returned an error. Please notify your Leaf administrator.";
        const forbidMessage = "You are not an authorized Leaf user. If you believe this is a mistake, please contact your Leaf administrator.";
        const retryMessage = "Attempting to authenticate user...";

        /*
         * Animate the progress bar to let user know Leaf is doing something.
         */
        dispatch(setSessionLoadState('', 0));
        setTimeout(() => dispatch(setSessionLoadState('', 100)), 500);

        /*
         * Get authorization config and version
         */ 
        getAuthConfig()
            .then(config => {
                dispatch(receiveAuthConfig(config));
                getUserTokenAndContext(config)
            .then((token) => {
                dispatch(setRouteConfig(getRoutes(config, token)));
                dispatch(receiveIdToken(token));
                removeSessionRetryKey();
                setTimeout(() => dispatch(setSessionLoadState('', 0)), 500);
            })
            .catch((reason) => {
                const forbidden = reason.response.status === 403;
                const errored = reason.response.status === 500;
                const retry = attemptLoginRetryIfPossible();
                console.log(reason);
                if (retry) {
                    dispatch(failureIdToken(retryMessage));
                } else if (forbidden) {
                    dispatch(failureIdToken(forbidMessage));
                } else if (errored) {
                    dispatch(failureIdToken(failMessage))
                } else {
                    dispatch(failureIdToken(notFoundMessage));
                }
            });
        }, error => {
            const forbidden = error.response.status === 403;
            const errored = error.response.status === 500;
            const retry = attemptLoginRetryIfPossible();
            console.log(error);
            if (retry) {
                dispatch(failureIdToken(retryMessage));
            } else if (forbidden) {
                dispatch(failureIdToken(forbidMessage));
            } else if (errored) {
                dispatch(failureIdToken(failMessage))
            } else {
                dispatch(failureIdToken(notFoundMessage));
            }
        });
    };
};

// Synchronous
export const receiveAuthConfig = (config: AppConfig): AuthorizationAction => {
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
