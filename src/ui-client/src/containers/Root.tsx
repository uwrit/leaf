/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
import { defaultCohortState } from '../reducers/cohort/cohort';
import { defaultConceptsState } from '../reducers/concepts';
import { defaultConceptSearchState } from '../reducers/conceptSearch';
import { defaultExportState } from '../reducers/dataExport';
import { defaultImportState } from '../reducers/dataImport';
import { defaultGeneralUiState } from '../reducers/generalUi';
import { defaultMapState } from '../reducers/map';
import { defaultRespondersState } from '../reducers/networkResponders';
import { defaultPanelFiltersState } from '../reducers/panelFilters';
import { defaultPanelState } from '../reducers/panels';
import { defaultQueriesState } from '../reducers/queries';
import { defaultSessionState } from '../reducers/session';
import { defaultDatasetsState } from '../reducers/datasets';
import configureStore from '../store/configureStore';
import App from './App';

const beginState: AppState = {
    auth: defaultAuthorizationState(),
    cohort: defaultCohortState(),
    conceptSearch: defaultConceptSearchState(),
    concepts: defaultConceptsState(),
    dataExport: defaultExportState(),
    dataImport: defaultImportState(),
    datasets: defaultDatasetsState(),
    generalUi: defaultGeneralUiState(),
    map: defaultMapState(),
    panelFilters: defaultPanelFiltersState(),
    panels: defaultPanelState(),
    responders: defaultRespondersState(),
    queries: defaultQueriesState(),
    session: defaultSessionState()
}

const store = configureStore(beginState);

export default class Root extends React.Component {
    public render() {
        return (
            <Provider store={store}>
                <DndProvider backend={HTML5Backend}>
                    <App />
                </DndProvider>
            </Provider>
        )
    }
}