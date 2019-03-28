/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { DateBoundary } from './Date';
import { SubPanel, SubPanelDTO, subPanelToDto } from './SubPanel'

export interface BasePanel {
    dateFilter: DateBoundary;
    id: string;
    includePanel: boolean;
    domain: string;
    index: number;
}

export interface PanelDTO extends BasePanel {
    subPanels: SubPanelDTO[];
 }

export interface Panel extends BasePanel {
    dateFilter: DateBoundary;
    id: string;
    includePanel: boolean;
    domain: string;
    index: number;
    subPanels: SubPanel[];
}

export const panelToDto = (panel: Panel): PanelDTO => {
    return {
        dateFilter: panel.dateFilter,
        domain: panel.domain,
        id: panel.id,
        includePanel: panel.includePanel,
        index: panel.index,
        subPanels: panel.subPanels.map(s => subPanelToDto(s))
    }   
}