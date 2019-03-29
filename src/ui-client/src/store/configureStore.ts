/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import rootReducer from '../reducers/rootReducer';

export default function configureStore(preloadedState: any) {
    return createStore(
        rootReducer,
        /* preloadedState, */
        composeWithDevTools(
            applyMiddleware(
                thunkMiddleware
            )
        )
    )
};