/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { 
    ADD_PANEL_ITEM, 
    REMOVE_PANEL_ITEM,
    HIDE_PANEL_ITEM,
    RESET_PANELS,
    SET_PANEL_DATE_FILTER,
    SET_PANEL_INCLUSION,
    SET_PANEL_ITEM_NUMERIC_FILTER,
    SET_SUBPANEL_INCLUSION,
    SET_SUBPANEL_JOIN_SEQUENCE,
    SET_SUBPANEL_MINCOUNT,
    DESELECT_CONCEPT_SPECIALIZATION,
    SELECT_CONCEPT_SPECIALIZATION,
    SET_PANELS
 } from '../actions/panels';
import {
    OPEN_SAVED_QUERY,
    SaveQueryAction
} from '../actions/queries'
import { PanelAction, PanelItemAction } from '../actions/panels';
import { DateBoundary, DateIncrementType } from '../models/panel/Date';
import { NumericFilterType } from '../models/panel/NumericFilter';
import { Panel } from '../models/panel/Panel';
import { RecencyFilterType } from '../models/panel/RecencyFilter';
import { SequenceType } from '../models/panel/SubPanel';
import { ConceptSpecialization, ExtensionConcept } from '../models/concept/Concept';
import { SavedQuery } from '../models/Query';

const ANYTIME = 'Anytime';

export const defaultPanelState = (): Panel[] => {
    const defaultPanels: Panel[] = [];
    const defaultDateFilter: DateBoundary = {
        display: ANYTIME,
        end: {
            dateIncrementType: DateIncrementType.NONE,
            increment: 1
        },
        start: {
            dateIncrementType: DateIncrementType.NONE,
            increment: 1
        }
    }

    // Add 3 Panels with 1 empty SubPanel each
    for (let i: number = 0; i < 3; i++ ) {
        defaultPanels.push({
            dateFilter: defaultDateFilter,
            domain: 'Panel',
            id: generateId(),
            includePanel: true,
            index: i,
            subPanels: [{
                dateFilter: {
                    dateIncrementType: DateIncrementType.NONE,
                    increment: 0
                },
                id: generateId(),
                includeSubPanel: true,
                index: 0,
                joinSequence: { 
                    dateIncrementType: DateIncrementType.DAY,
                    increment: 1,
                    sequenceType: SequenceType.Encounter
                },
                minimumCount: 1,
                panelIndex: i,
                panelItems: []
            }]
        })
    }
    return defaultPanels;
};

const addSubPanelIfNeeded = (panel: Panel): Panel => {
    if (panel.subPanels[panel.subPanels.length - 1].panelItems.length > 0) {
        panel.subPanels.push({
            dateFilter: {
                dateIncrementType: DateIncrementType.NONE,
                increment: 0
            },
            id: generateId(),
            includeSubPanel: true,
            index: panel.subPanels.length,
            joinSequence: { 
                dateIncrementType: DateIncrementType.DAY,
                increment: 1,
                sequenceType: SequenceType.Encounter
            },
            minimumCount: 1,
            panelIndex: panel.index,
            panelItems: []
        });
    }

    return panel;
};

const resetSubPanelIndexes = (panel: Panel): void => {
    // Remove any subpanels without panel items if they are not the last
    for (const i of panel.subPanels.keys()) {
        if (panel.subPanels[i].panelItems.filter((pi) => !pi.hidden).length === 0 && i !== panel.subPanels.length - 1) {
            panel.subPanels.splice(i, 1);
        }
    }

    // Reset indexes
    for (const i of panel.subPanels.keys()) {
        panel.subPanels[i].index = i;
        for (const j of panel.subPanels[i].panelItems.keys()) {
            panel.subPanels[i].panelItems[j].subPanelIndex = i;
            panel.subPanels[i].panelItems[j].index = j;
        }
    }
}

const updatePanel = (state: Panel[], action: PanelAction): Panel[] => {
    const newpanels = state.slice(0);
    const newpanel = Object.assign({}, newpanels[action.panelIndex]);
    const subpanel = Object.assign({}, newpanel.subPanels[action.subPanelIndex!]);
    newpanels[action.panelIndex] = newpanel;

    switch(action.type) {
        case SET_PANEL_INCLUSION:
            newpanel.includePanel = action.isInclusionCriteria!;
            return newpanels;
        case SET_SUBPANEL_INCLUSION:
            subpanel.includeSubPanel = action.isInclusionCriteria!;
            newpanel.subPanels[action.subPanelIndex!] = subpanel;
            return newpanels;
        case SET_SUBPANEL_MINCOUNT:
            subpanel.minimumCount = action.minCount!;
            newpanel.subPanels[action.subPanelIndex!] = subpanel;
            return newpanels;
        case SET_SUBPANEL_JOIN_SEQUENCE:
            subpanel.joinSequence = action.joinSequence!
            newpanel.subPanels[action.subPanelIndex!] = subpanel;
            return newpanels;
        case SET_PANEL_DATE_FILTER:
            newpanel.dateFilter = action.dateFilter!;
            return newpanels;
        default:
            return state;
    }
};

const updatePanelItems = (state: Panel[], action: PanelItemAction): Panel[] => {
    const newpanels: Panel[] = state.slice();
    const panel = Object.assign({}, newpanels[action.panelIndex]);
    const subpanel = panel.subPanels[action.subPanelIndex];
    const panelItem = Object.assign({}, subpanel.panelItems[action.panelItemIndex!]);
    const concepts = action.concept!.isExtension && (action.concept! as ExtensionConcept).injectChildrenOnDrop
        ? (action.concept! as ExtensionConcept).injectChildrenOnDrop
        : [ action.concept ];
    newpanels[action.panelIndex] = panel;

    switch (action.type) {
        case ADD_PANEL_ITEM:

            // Add the concept to the respective subpanel
            for (const concept of concepts!) {
                // Add the concept to the respective subpanel
                subpanel.panelItems.push({
                    concept: concept!,
                    id: generateId(),
                    index: subpanel.panelItems.length,
                    numericFilter: {
                        filter: [null, null],
                        filterType: NumericFilterType.None
                    },
                    panelIndex: panel.index,
                    recencyFilter: RecencyFilterType.None,
                    subPanelIndex: subpanel.index,
                    specializations: []
                });

                // Add the Concept Event type if the subpanel doesn't already
                // have one, and the Concept does.
                if (concept.eventTypeId && !subpanel.joinSequenceEventType) {
                    subpanel.joinSequenceEventType = { id: concept.eventTypeId, name: concept.uiDisplayEventName! };
                }
            }

            // Add a new subpanel if the current last subpanel now has at least 1 panel item
            newpanels[action.panelIndex] = addSubPanelIfNeeded(panel);
            return newpanels;

        case REMOVE_PANEL_ITEM:

            // Remove the selected panel item
            subpanel.panelItems.splice(action.panelItemIndex!, 1);
            const hasPi = subpanel.panelItems.length > 0;

            if (!hasPi) {
                subpanel.joinSequenceEventType = undefined;
            }

            // Reset indexes and remove empty subpanels
            if (!hasPi && subpanel.index > 0) { 
                newpanels[action.panelIndex].subPanels.splice(subpanel.index, 1);
            }
            resetSubPanelIndexes(panel);

            // Add a new subpanel if the current last subpanel now has at least 1 panel item
            newpanels[action.panelIndex] = addSubPanelIfNeeded(panel);
            return newpanels;

        case HIDE_PANEL_ITEM:

            // Hide the panel item
            panelItem.hidden = true;
            subpanel.panelItems[action.panelItemIndex!] = panelItem;

            // Remove the following subpanel if this subpanel now empty
            if (panel.subPanels[action.subPanelIndex].panelItems.length === 1 &&
                panel.subPanels[action.subPanelIndex+1] && 
                panel.subPanels[action.subPanelIndex+1].panelItems.length === 0
            ) {
                panel.subPanels.splice(action.subPanelIndex+1, 1);
            }

            return newpanels;
            
        case SET_PANEL_ITEM_NUMERIC_FILTER:
            panelItem.numericFilter = action.numericFilter!;
            subpanel.panelItems[action.panelItemIndex!] = panelItem;
            return newpanels;
        
        case DESELECT_CONCEPT_SPECIALIZATION:
        case SELECT_CONCEPT_SPECIALIZATION:
            const specialization = action.conceptSpecialization;
            const group = action.conceptSpecializationGroup;
            const selected = panelItem.specializations.slice();
            let newSelected: ConceptSpecialization[] = [];

            if (specialization) {
                newSelected = selected.filter((s) => s.specializationGroupId !== specialization.specializationGroupId);
                newSelected.push(specialization);
            }
            else {
                newSelected = selected.filter((s) => s.specializationGroupId !== group!.id);
            }
            panelItem.specializations = newSelected;
            subpanel.panelItems[action.panelItemIndex!] = panelItem;
            return newpanels;
            
    }
    return newpanels;
};

export const panels = (state: Panel[] = defaultPanelState(), action: any): Panel[] => {

    switch (action.type) {
        case ADD_PANEL_ITEM:
        case REMOVE_PANEL_ITEM:
        case HIDE_PANEL_ITEM:
        case SET_PANEL_ITEM_NUMERIC_FILTER:
        case SELECT_CONCEPT_SPECIALIZATION:
        case DESELECT_CONCEPT_SPECIALIZATION:
            return updatePanelItems(state, action);
        case SET_PANEL_INCLUSION:
        case SET_PANEL_DATE_FILTER:
        case SET_SUBPANEL_INCLUSION:
        case SET_SUBPANEL_MINCOUNT:
        case SET_SUBPANEL_JOIN_SEQUENCE:
            return updatePanel(state, action);
        case RESET_PANELS:
            return defaultPanelState();
        case OPEN_SAVED_QUERY:
            return ((action as SaveQueryAction).query as SavedQuery).panels!;
        case SET_PANELS:
            return action.panels;
        default:
            return state;
    }
}
