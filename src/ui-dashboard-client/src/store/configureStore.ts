/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import { createReduxHistoryContext, reachify } from "redux-first-history";
import { createBrowserHistory } from 'history';
import rootReducer from '../reducers/rootReducer';
import { AppState } from '../models/state/AppState';
import { defaultAuthorizationState } from '../reducers/auth';
import { defaultSessionState } from '../reducers/session';
import { defaultDashboardConfigurationState } from '../reducers/config';
import { defaultCohortState } from '../reducers/cohort';

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({ 
    history: createBrowserHistory(),
});

export default function configureStore(preloadedState: any) {
    return createStore(
        rootReducer,
        composeWithDevTools(
            applyMiddleware(
                thunkMiddleware,
                routerMiddleware
            )
        )
    )
};

export const beginState: AppState = {
    auth: defaultAuthorizationState(),
    cohort: defaultCohortState(),
    config: defaultDashboardConfigurationState(),
    session: defaultSessionState()
};

export const history = createReduxHistory(configureStore(beginState));
export const reachHistory = reachify(history);
