/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminConfigurationAction } from "../../actions/admin/configuration";

export const setAdminSqlConfiguration = (state: AdminState, action: AdminConfigurationAction) => {
    const sqlConfig = action.sqlConfig!;
    return Object.assign({}, state, { 
        configuration: {
            ...state.configuration,
            sql: sqlConfig
        }
    });
};