/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AppState } from "../../models/state/AppState";
import { AdminNetworkAndIdentityState } from "../../models/state/AdminState";
import { upsertIdentity } from "../../services/admin/networkAndIdentityApi";
import { saveOrUpdateNetworkEndpoint } from "../../actions/admin/networkAndIdentity";

/*
 * Create async function queue to process all changes
 * to the current network identity and endpoints.
 */
export const getApiUpdateQueue = (networkAndIdentity: AdminNetworkAndIdentityState, dispatch: any, state: AppState): any[] => {
    const queue: any[] = [];

    if (networkAndIdentity.identity !== networkAndIdentity.uneditedIdentity) {
        queue.push( async () => upsertIdentity(state, networkAndIdentity.identity));
    }

    networkAndIdentity.endpoints.forEach((endpoint) => {
        if (endpoint.unsaved || endpoint.changed) {
            queue.push( async () => saveOrUpdateNetworkEndpoint(endpoint, dispatch, state));
        }
    });
    return queue;
};