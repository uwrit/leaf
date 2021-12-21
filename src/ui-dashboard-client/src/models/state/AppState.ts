/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppConfig, UserContext } from "../Auth";
import { DashboardConfig } from "../config/config";
import { SessionState } from "../Session";
import { CohortState } from "./CohortState";


export interface AuthorizationState {
    config?: AppConfig;
    error?: string;
    userContext?: UserContext;
}

export interface AppState {
    auth: AuthorizationState;
    cohort: CohortState;
    config: DashboardConfig;
    session: SessionState;
}