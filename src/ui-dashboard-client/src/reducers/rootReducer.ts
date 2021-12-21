/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { combineReducers } from 'redux';
import { auth } from './auth';
import { session } from './session';
import { createReduxHistoryContext, reachify } from "redux-first-history";
import { createBrowserHistory } from 'history';

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({ 
    history: createBrowserHistory(),
});

const rootReducer = combineReducers({
    auth,
    session,
    
    router: routerReducer
});

export default rootReducer;
