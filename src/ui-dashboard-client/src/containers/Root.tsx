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
import configureStore, { beginState, history } from '../store/configureStore';
import { HistoryRouter as Router } from "redux-first-history/rr6";
import App from './App';

const store = configureStore(beginState);

export default class Root extends React.Component {
    public render() {
        return (
            <Provider store={store}>
                <Router history={history} >
                    <DndProvider backend={HTML5Backend}>
                        <App />
                    </DndProvider>
                </Router>
            </Provider>
        )
    }
}