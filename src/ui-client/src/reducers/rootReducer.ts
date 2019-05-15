/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { combineReducers } from 'redux';
import { auth } from './auth';
import { cohort } from './cohort/cohort';
import { concepts } from './concepts';
import { conceptSearch } from './conceptSearch';
import { dataExport } from './dataExport';
import { generalUi } from './generalUi';
import { map } from './map';
import { responders } from './networkResponders';
import { panelFilters } from './panelFilters';
import { panels } from './panels';
import { queries } from './queries';
import { session } from './session';
import { admin } from './admin/admin';

const rootReducer = combineReducers({
    admin,
    auth,
    cohort,
    conceptSearch,
    concepts,
    dataExport,
    generalUi,
    map,
    panelFilters,
    panels,
    responders,
    queries,
    session
});

export default rootReducer;
