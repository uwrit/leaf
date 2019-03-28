/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { 
    AuthorizationAction,
    FAILURE_ID_TOKEN,
    RECEIVE_AUTH_CONFIG,
    RECEIVE_ID_TOKEN
} from '../actions/auth';
import { AuthorizationState } from '../models/state/AppState';
import { AuthConfig, UserContext } from '../models/Auth';

export function defaultAuthorizationState(): AuthorizationState {
    return { };
}

const setIdTokenAndDates = (state: AuthorizationState, context: UserContext) => {
    return Object.assign({}, state, {
        error: null, 
        userContext: context
    })
}

const setAuthConfig = (state: AuthorizationState, config: AuthConfig) => {
    return Object.assign({}, state, {
        config
    })
}

export function auth(state: AuthorizationState = defaultAuthorizationState(), action: AuthorizationAction): AuthorizationState {
    switch (action.type) {
        case RECEIVE_ID_TOKEN:
            return setIdTokenAndDates(state, action.context!);
        case RECEIVE_AUTH_CONFIG:
            return setAuthConfig(state, action.config!);
        case FAILURE_ID_TOKEN:
            return Object.assign({}, state, {
                error: action.message
            });
        default:
            return state;
    }
}
