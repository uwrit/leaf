/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { SqlConfiguration } from "../../models/admin/Configuration";
import { AppState } from "../../models/state/AppState";
import { getSqlConfiguration } from "../../services/admin/configApi";

export const SET_ADMIN_SQL_CONFIGURATION = 'SET_ADMIN_SQL_CONFIGURATION';

export interface AdminConfigurationAction {
    sqlConfig?: SqlConfiguration;
    type: string;
}

// Asynchronous
/*
 * Fetch SQL Configuration.
 */
export const getAdminSqlConfiguration = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        const config = await getSqlConfiguration(state);
        dispatch(setAdminSqlConfiguration(config));
    };
};

// Synchronous
const setAdminSqlConfiguration = (sqlConfig: SqlConfiguration) => {
    return {
        sqlConfig,
        type: SET_ADMIN_SQL_CONFIGURATION
    };
};