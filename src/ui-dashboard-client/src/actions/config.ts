/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { DashboardConfig } from '../models/config/config';

export const SET_DASHBOARD_CONFIG = 'SET_DASHBOARD_CONFIG';

export interface ConfigAction {
    config?: DashboardConfig;
    message?: string;
    type: string;
}

// Asynchronous

// Synchronous
export const setDashboardConfig = (config: DashboardConfig): ConfigAction => {
    return {
        config,
        type: SET_DASHBOARD_CONFIG
    };
};
