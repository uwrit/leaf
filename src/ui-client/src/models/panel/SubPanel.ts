/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { DateFilter, DateIncrementType } from './Date';
import { PanelItem, PanelItemDTO, panelItemToDto } from './PanelItem'

export interface BaseSubPanel {
    dateFilter: DateFilter;
    id: string;
    index: number;
    includeSubPanel: boolean;
    minimumCount: number;
    panelIndex: number;
    joinSequence: SubPanelJoinSequence;
}

export interface SubPanelDTO extends BaseSubPanel {
    panelItems: PanelItemDTO[];
 }

export interface SubPanel extends BaseSubPanel {
    panelItems: PanelItem[];
    joinSequenceEventType?: JoinSequenceEventType;
}

export interface JoinSequenceEventType {
    id: number;
    name: string;
}

export const subPanelToDto = (subpanel: SubPanel): SubPanelDTO => {
    return {
        dateFilter: subpanel.dateFilter,
        id: subpanel.id,
        includeSubPanel: subpanel.includeSubPanel,
        index: subpanel.index,
        joinSequence: subpanel.joinSequence,
        minimumCount: subpanel.minimumCount,
        panelIndex: subpanel.panelIndex,
        panelItems: subpanel.panelItems.map(i => panelItemToDto(i))
    }
}

export interface SubPanelJoinSequence {
    increment: number | null;
    dateIncrementType: DateIncrementType;
    sequenceType: SequenceType;
}

export enum SequenceType {
    Encounter = 0,
    PlusMinus = 1,
    WithinFollowing = 2,
    AnytimeFollowing = 3,
    Event = 4
}