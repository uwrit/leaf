/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { AppState } from '../models/state/AppState';
import { defaultAuthorizationState } from '../reducers/auth';
import { defaultSessionState } from '../reducers/session';
import configureStore from '../store/configureStore';
import { BrowserRouter } from "react-router-dom";
import App from './App';

const beginState: AppState = {
    auth: defaultAuthorizationState(),
    session: defaultSessionState()
}

const store = configureStore(beginState);

export default class Root extends React.Component {
    public render() {
        return (
            <BrowserRouter>
                <Provider store={store}>
                    <DndProvider backend={HTML5Backend}>
                        <App />
                    </DndProvider>
                </Provider>
            </BrowserRouter>
        )
    }
}