/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { PanelFilter } from '../../models/admin/PanelFilter';
import { saveOrUpdateAdminPanelFilter } from '../../actions/admin/panelFilter';

export const getApiUpdateQueue = (pfs: Map<number,PanelFilter>, dispatch: any, state: AppState): any[] => {
    const queue: any[] = [];
    pfs.forEach((pf) => {
        if (pf.unsaved || pf.changed) {
            queue.push( async () => await saveOrUpdateAdminPanelFilter(pf, dispatch, state));
        }
    });
    return queue;
};