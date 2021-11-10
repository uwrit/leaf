/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { GlobalPanelFilter } from '../../models/admin/GlobalPanelFilter';
import { saveOrUpdateAdminGlobalPanelFilter } from '../../actions/admin/globalPanelFilter';

export const getApiUpdateQueue = (pfs: Map<number,GlobalPanelFilter>, dispatch: any, state: AppState): any[] => {
    const queue: any[] = [];
    pfs.forEach((pf) => {
        if (pf.unsaved || pf.changed) {
            queue.push( async () => await saveOrUpdateAdminGlobalPanelFilter(pf, dispatch, state));
        }
    });
    return queue;
};