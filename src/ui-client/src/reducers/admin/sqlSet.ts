/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState, { AdminPanelUpdateObjectType } from "../../models/state/AdminState";
import { AdminSqlSetAction } from "../../actions/admin/sqlSet";

export const setAdminConceptSqlSets = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    const sets = action.sets!;
    for (const set of sets) {
        state.sqlSets.sets.set(set.id, set);
    }
    return Object.assign({}, state);
};

export const setAdminCurrentConceptSqlSets = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    const sets = action.sets!;
    for (const set of sets) {
        state.sqlSets.sets.set(set.id, set);
    }
    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            changed: action.changed
        }
    });
};

export const setAdminUneditedConceptSqlSet = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            uneditedSet: action.set
        }
    });
};

export const deleteAdminConceptSqlSet = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    const set = action.set!;
    state.sqlSets.sets.delete(set.id);
    return Object.assign({}, state);
};

export const setAdminUnsavedConceptSqlSets = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            unsavedSets: action.mappedSets
        }
    });
};

export const upsertAdminQueuedApiEvent = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    const newEv = action.queuedApiEvent!;
    const events = state.sqlSets.updateQueue.slice();
    let isUpdate = false;

    for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        if (ev.objectType === newEv.objectType && ev.id === newEv.id) {
            events.splice(i, 1, newEv);
            isUpdate = true;
        }
    }
    if (!isUpdate) {
        events.push(newEv);
    }
    console.log('reducer events', events);
    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            updateQueue: events
        }
    });
};

export const removeAdminQueuedApiEvent = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    const events = state.sqlSets.updateQueue.filter((ev) => ev.id !== action.id!);
    console.log('reducer events', events);
    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            updateQueue: events
        }
    });
};