/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { 
    AuthorizationAction,
    FAILURE_ID_TOKEN,
    RECEIVE_AUTH_CONFIG,
    RECEIVE_ID_TOKEN,
    SET_SERVER_STATE
} from '../actions/auth';
import { AuthorizationState } from '../models/state/AppState';
import { AppConfig, UserContext } from '../models/Auth';
import { ServerStateDTO, ServerState } from '../models/state/ServerState';
import { getViewedNotifications } from '../services/sessionApi';

export function defaultAuthorizationState(): AuthorizationState {
    return {
        viewedNotifications: getViewedNotifications()
    };
}

const setIdTokenAndDates = (state: AuthorizationState, context: UserContext) => {
    return Object.assign({}, state, {
        error: null, 
        userContext: context
    })
};

const setAuthConfig = (state: AuthorizationState, config: AppConfig) => {
    return Object.assign({}, state, {
        config
    })
};

const setServerState = (state: AuthorizationState, dto: ServerStateDTO) => {
    const serverState: ServerState = {
        isUp: dto.isUp,
        downtimeMessage: dto.downtimeMessage,
        downtimeFrom: new Date(dto.downtimeFrom),
        downtimeUntil: new Date(dto.downtimeUntil),
        notifications: dto.notifications
    };
    return Object.assign({}, state, { serverState });
};

export function auth(state: AuthorizationState = defaultAuthorizationState(), action: AuthorizationAction): AuthorizationState {
    switch (action.type) {
        case SET_SERVER_STATE:
            return setServerState(state, action.serverState);
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
