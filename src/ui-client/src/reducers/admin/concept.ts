/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState, { AdminPanelLoadState } from "../../models/state/AdminState";
import { AdminConceptAction } from "../../actions/admin/concept";
import { Panel } from "../../models/panel/Panel";
import { DateIncrementType } from "../../models/panel/Date";

export const setAdminPanelConceptLoadState = (state: AdminState, action: AdminConceptAction) => {
    return Object.assign({}, state, { 
        concepts: { 
            ...state.concepts,
            state: action.state
        }
    });
};

export const setAdminConcept = (state: AdminState, action: AdminConceptAction) => {
    const concept = action.concept!;
    const newPanel = Object.assign({}, state.concepts.examplePanel);
    const newPanelItem = Object.assign({}, newPanel.subPanels[0].panelItems[0], { concept });
    const changed = action.changed;
    newPanel.subPanels[0].panelItems[0] = newPanelItem;
    state.concepts.concepts.set(concept.id, concept);

    return Object.assign({}, state, { 
        concepts: { 
            ...state.concepts,
            changed,
            examplePanel: newPanel,
            currentConcept: concept,
            uneditedAdminConcept: changed ? state.concepts.uneditedAdminConcept : concept,
            state: AdminPanelLoadState.LOADED
        }
    });
};

export const setAdminUiConceptOriginal = (state: AdminState, action: AdminConceptAction) => {
    return Object.assign({}, state, { 
        concepts: { 
            ...state.concepts,
            uneditedUiConcept: action.uiConcept,
        }
    });
};

export const setExampleSql = (state: AdminState, action: AdminConceptAction) => {
    return Object.assign({}, state, {
        concepts: { 
            ...state.concepts,
            exampleSql: action.sql
        }
    });
}; 

export const revertAdminConceptToOriginal = (state: AdminState, action: AdminConceptAction) => {
    const orig = state.concepts.uneditedAdminConcept!;
    state.concepts.concepts.set(orig.id, orig);

    return Object.assign({}, state, {
        concepts: { 
            ...state.concepts,
            changed: false,
            currentConcept: orig
        }
    });
};

export const deleteAdminConceptFromCache = (state: AdminState, action: AdminConceptAction) => {
    state.concepts.concepts.delete(state.concepts.currentConcept!.id);
    return Object.assign({}, state, {
        concepts: { 
            ...state.concepts,
            changed: false,
            currentConcept: undefined,
            originalConcept: undefined,
            originalUiConcept: undefined
        }
    });
};

export const setAdminPanelConceptEditorPane = (state: AdminState, action: AdminConceptAction) => {
    return Object.assign({}, state, {
        concepts: { 
            ...state.concepts,
            pane: action.pane
        }
    });
}; 

export const generateDummyPanel = (): Panel => {
    const panel: Panel = {
        dateFilter: {
            end: { dateIncrementType: DateIncrementType.NONE },
            start: { dateIncrementType: DateIncrementType.NONE }
        },
        domain: '',
        index: 0,
        id: '',
        includePanel: true,
        subPanels: [{
            panelIndex: 0,
            id: '',
            index: 0,
            includeSubPanel: true,
            minimumCount: 1,
            dateFilter: {
                dateIncrementType: DateIncrementType.NONE
            },
            joinSequence: {
                increment: 0,
                dateIncrementType: DateIncrementType.NONE,
                sequenceType: 0
            },
            panelItems: [{
                concept: {
                    rootId: '',
                    id: '',
                    isEncounterBased: false,
                    isEventBased: false,
                    isNumeric: false,
                    isParent: false,
                    isPatientCountAutoCalculated: false,
                    isSpecializable: false,
                    uiDisplayName: '',
                    uiDisplayText: '',
                    childrenLoaded: false,
                    isFetching: false,
                    isOpen: false
                },
                id: '',
                index: 0,
                numericFilter: {
                    filter: [0, 0],
                    filterType: 0
                },
                panelIndex: 0,
                recencyFilter: 0,
                subPanelIndex: 0,
                specializations: []
            }]
        }]
    };
    return panel;
};