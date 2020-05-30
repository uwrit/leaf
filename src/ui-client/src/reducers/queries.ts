/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { 
    SaveQueryAction, 
    SET_CURRENT_SAVED_QUERY, 
    ADD_SAVED_QUERIES,
    REMOVE_SAVED_QUERIES,
    SET_RUN_AFTER_SAVE
} from '../actions/queries';
import { SET_PANEL_FILTERS, TOGGLE_PANEL_FILTER } from '../actions/panelFilter';
import { 
    ADD_PANEL_ITEM, 
    REMOVE_PANEL_ITEM,
    SET_PANEL_DATE_FILTER,
    SET_PANEL_INCLUSION,
    SET_PANEL_ITEM_NUMERIC_FILTER,
    SET_SUBPANEL_INCLUSION,
    SET_SUBPANEL_JOIN_SEQUENCE,
    SET_SUBPANEL_MINCOUNT,
    SELECT_CONCEPT_SPECIALIZATION,
    DESELECT_CONCEPT_SPECIALIZATION
 } from '../actions/panels';
import { SavedQueriesState, SavedQueryRef } from '../models/Query';
import { generate as generateId } from 'shortid';

export const defaultQueriesState = (): SavedQueriesState => {
    return {
        current: { name: '', category: '', description: '' },
        currentChangeId: '',
        lastSavedChangeId: '',
        saved: new Map<string, SavedQueryRef>(),
        runAfterSave: () => null
    };
};

export const addSavedQueries = (state: SavedQueriesState, action: SaveQueryAction) => {
    const qs = action.queries!;
    qs.forEach((q) => state.saved.set(q.universalId!, { ...q, created: new Date(q.created!), updated: new Date(q.updated!) }));
    return Object.assign({}, state);
};

export const removeSavedQueries = (state: SavedQueriesState, action: SaveQueryAction) => {
    const qs = action.queries!;
    qs.forEach((q) => state.saved.delete(q.universalId!));
    return Object.assign({}, state);
};

export const queries = (state: SavedQueriesState = defaultQueriesState(), action: SaveQueryAction): SavedQueriesState => {
    switch (action.type) {
        case SET_CURRENT_SAVED_QUERY:
            const changeId = generateId();
            return Object.assign({}, state, { 
                current: { ...action.query! }, 
                currentChangeId: changeId, 
                lastSavedChangeId: (action.updateSavedChangeId ? changeId : state.lastSavedChangeId)
            });
        case SET_RUN_AFTER_SAVE:
            return Object.assign({}, state, { runAfterSave: action.runAfterSave! });
        case ADD_SAVED_QUERIES:
            return addSavedQueries(state, action);
        case REMOVE_SAVED_QUERIES:
            return removeSavedQueries(state, action);
        case ADD_PANEL_ITEM:
        case REMOVE_PANEL_ITEM:
        case SET_PANEL_ITEM_NUMERIC_FILTER:
        case SET_PANEL_INCLUSION:
        case SET_PANEL_DATE_FILTER:
        case SET_SUBPANEL_INCLUSION:
        case SET_SUBPANEL_MINCOUNT:
        case SET_SUBPANEL_JOIN_SEQUENCE:
        case SELECT_CONCEPT_SPECIALIZATION:
        case DESELECT_CONCEPT_SPECIALIZATION:
        case SET_PANEL_FILTERS:
        case TOGGLE_PANEL_FILTER:
            return Object.assign({}, state, { currentChangeId: generateId() });
        default:
            return state;
    }
};