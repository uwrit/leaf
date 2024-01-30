/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept, ConceptSpecialization, ConceptSpecializationGroup } from '../models/concept/Concept';
import { DateBoundary } from '../models/panel/Date';
import { NumericFilter } from '../models/panel/NumericFilter';
import { SubPanelJoinSequence } from '../models/panel/SubPanel';
import { Panel } from '../models/panel/Panel';
import { DbQueryMode } from '../models/Auth';

export const ADD_PANEL_ITEM = 'ADD_PANEL_ITEM';
export const REMOVE_PANEL_ITEM = 'REMOVE_PANEL_ITEM';
export const HIDE_PANEL_ITEM = 'HIDE_PANEL_ITEM';
export const SELECT_CONCEPT_SPECIALIZATION = 'SELECT_CONCEPT_SPECIALIZATION';
export const DESELECT_CONCEPT_SPECIALIZATION = 'DESELECT_CONCEPT_SPECIALIZATION';
export const SET_PANEL_INCLUSION = 'SET_PANEL_INCLUSION';
export const SET_SUBPANEL_INCLUSION = 'SET_SUBPANEL_INCLUSION';
export const SET_SUBPANEL_MINCOUNT = 'SET_SUBPANEL_MINCOUNT';
export const SET_SUBPANEL_JOIN_SEQUENCE = 'SET_SUBPANEL_JOIN_SEQUENCE';
export const SET_PANEL_DATE_FILTER = 'SET_PANEL_DATE_FILTER';
export const SET_PANEL_ITEM_NUMERIC_FILTER = 'SET_PANEL_ITEM_NUMERIC_FILTER';
export const RESET_PANELS = 'RESET_PANELS';
export const SET_PANELS = 'SET_PANELS';

export interface PanelItemAction {
    type: string;
    concept: Concept;
    conceptSpecialization?: ConceptSpecialization;
    conceptSpecializationGroup?: ConceptSpecializationGroup;
    mode?: DbQueryMode;
    panelIndex: number;
    subPanelIndex: number;
    panelItemIndex?: number;
    numericFilter?: NumericFilter;
}

export interface PanelAction {
    type: string;
    dateFilter?: DateBoundary;
    isInclusionCriteria?: boolean;
    joinSequence?: SubPanelJoinSequence;
    minCount?: number;
    subPanelIndex?: number;
    panelIndex: number;
    panels?: Panel[];
}

export const setPanelItemNumericFilter = (
    concept: Concept, 
    panelIndex: number, 
    subPanelIndex: number, 
    panelItemIndex: number, 
    numericFilter: NumericFilter
): PanelItemAction => {
    return {
        concept,
        numericFilter,
        panelIndex,
        panelItemIndex,
        subPanelIndex,
        type: SET_PANEL_ITEM_NUMERIC_FILTER
    };
};

export const addPanelItem = (concept: Concept, panelIndex: number, subPanelIndex: number, mode: DbQueryMode): PanelItemAction => {
    return {
        concept,
        panelIndex,
        subPanelIndex,
        type: ADD_PANEL_ITEM
    };
};

export const removePanelItem = (
    concept: Concept, panelIndex: number, subPanelIndex: number, panelItemIndex: number, mode: DbQueryMode): PanelItemAction => {
    return {
        concept,
        panelIndex,
        panelItemIndex,
        subPanelIndex,
        type: REMOVE_PANEL_ITEM
    };
};

export const hidePanelItem = (concept: Concept, panelIndex: number, subPanelIndex: number, panelItemIndex: number): PanelItemAction => {
    return {
        concept,
        panelIndex,
        panelItemIndex,
        subPanelIndex,
        type: HIDE_PANEL_ITEM
    };
};

export const setPanelInclusion = (panelIndex: number, isInclusionCriteria: boolean): PanelAction => {
    return {
        isInclusionCriteria,
        panelIndex,
        type: SET_PANEL_INCLUSION
    };
};

export const setSubPanelInclusion = (panelIndex: number, subPanelIndex: number, isInclusionCriteria: boolean): PanelAction => {
    return {
        isInclusionCriteria,
        panelIndex,
        subPanelIndex,
        type: SET_SUBPANEL_INCLUSION
    };
};

export const setSubPanelCount = (panelIndex: number, subPanelIndex: number, minCount: number): PanelAction => {
    return {
        minCount,
        panelIndex,
        subPanelIndex,
        type: SET_SUBPANEL_MINCOUNT
    };
}

export const setSubPanelJoinSequence = (panelIndex: number, subPanelIndex: number, joinSequence: SubPanelJoinSequence): PanelAction => {
    return {
        joinSequence,
        panelIndex,
        subPanelIndex,
        type: SET_SUBPANEL_JOIN_SEQUENCE
    };
}

export const setPanelDateFilter = (panelIndex: number, dateFilter: DateBoundary): PanelAction => {
    return {
        dateFilter,
        panelIndex,
        type: SET_PANEL_DATE_FILTER
    };
};

export const resetPanels = () => {
    return {
        type: RESET_PANELS
    }
};

export const selectSpecialization = (concept: Concept, panelIndex: number, subPanelIndex: number, panelItemIndex: number, conceptSpecialization: ConceptSpecialization) => {
    return {
        concept,
        panelIndex,
        subPanelIndex,
        panelItemIndex,
        conceptSpecialization,
        type: SELECT_CONCEPT_SPECIALIZATION
    }
};

export const deselectSpecialization = (concept: Concept, panelIndex: number, subPanelIndex: number, panelItemIndex: number, conceptSpecializationGroup: ConceptSpecializationGroup) => {
    return {
        concept,
        panelIndex,
        subPanelIndex,
        panelItemIndex,
        conceptSpecializationGroup,
        type: DESELECT_CONCEPT_SPECIALIZATION
    }
};

export const setPanels = (panels: Panel[]) => {
    return {
        panels,
        type: SET_PANELS
    }
};