/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState, { AdminPanelLoadState } from "../../models/state/AdminState";
import { AdminConceptAction } from "../../actions/admin/concept";
import { Panel } from "../../models/panel/Panel";
import { DateIncrementType } from "../../models/panel/Date";

export const setAdminPanelConceptLoadState = (state: AdminState, action: AdminConceptAction): AdminState => {
    return Object.assign({}, state, { 
        concepts: { 
            ...state.concepts,
            state: action.state
        }
    });
};

export const setAdminConcept = (state: AdminState, action: AdminConceptAction): AdminState => {
    const adminConcept = Object.assign({}, action.adminConcept!, { isRoot: !action.adminConcept!.parentId });
    const changed = action.changed;
    state.concepts.concepts.set(adminConcept.id, adminConcept);

    return Object.assign({}, state, { 
        concepts: { 
            ...state.concepts,
            changed,
            currentAdminConcept: adminConcept,
            state: AdminPanelLoadState.LOADED
        }
    });
};

export const setAdminCurrentUserConcept = (state: AdminState, action: AdminConceptAction): AdminState => {
    const userConcept = action.userConcept!;
    const newPanel = Object.assign({}, state.concepts.examplePanel);
    const newPanelItem = Object.assign({}, newPanel.subPanels[0].panelItems[0], { concept: userConcept });
    newPanel.subPanels[0].panelItems[0] = newPanelItem;

    return Object.assign({}, state, { 
        concepts: { 
            ...state.concepts,
            examplePanel: newPanel,
            currentUserConcept: action.userConcept
        }
    });
};

export const setExampleSql = (state: AdminState, action: AdminConceptAction): AdminState => {
    return Object.assign({}, state, {
        concepts: { 
            ...state.concepts,
            exampleSql: action.sql
        }
    });
}; 

export const resetAdminConceptCache = (state: AdminState, action: AdminConceptAction): AdminState => {
    const concepts = state.concepts;
    concepts.concepts.clear();

    if (concepts.currentAdminConcept) {
        concepts.concepts.set(concepts.currentAdminConcept.id, concepts.currentAdminConcept);
    }

    return Object.assign({}, state, {
        concepts: { 
            ...state.concepts,
            concepts: new Map(concepts.concepts)
        }
    });
}; 

export const removeUnsavedAdminConcept = (state: AdminState, action: AdminConceptAction): AdminState => {
    return Object.assign({}, state, {
        concepts: { 
            ...state.concepts,
            currentAdminConcept: undefined,
            currentUserConcept: undefined,
            changed: false
        }
    });
}; 

export const deleteAdminConceptFromCache = (state: AdminState, action: AdminConceptAction): AdminState => {
    state.concepts.concepts.delete(state.concepts.currentAdminConcept!.id);
    return Object.assign({}, state, {
        concepts: { 
            ...state.concepts,
            changed: false,
            currentAdminConcept: undefined
        }
    });
};

export const createAdminConcept = (state: AdminState,  action: AdminConceptAction): AdminState => {
    const adminConcept = action.adminConcept!;
    state.concepts.concepts.set(adminConcept.id, adminConcept);

    return Object.assign({}, state, { 
        concepts: { 
            ...state.concepts,
            changed: true,
            currentAdminConcept: adminConcept
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