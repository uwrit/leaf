/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminSqlSetAction } from "../../actions/admin/sqlSet";
import { ConceptSqlSet } from "../../models/admin/Concept";
import { conceptSqlSetsChanged } from "../../utils/admin/sqlSet";

export const setAdminConceptSqlSets = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    const sets = action.sets!;
    let uneditedSets;
    for (const set of sets) {
        state.sqlSets.sets.set(set.id, Object.assign({}, set));
    }

    if (!action.changed) {
        uneditedSets = new Map(state.sqlSets.sets);
    } else if (state.sqlSets.uneditedSets) {
        uneditedSets = state.sqlSets.uneditedSets;
    }

    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            sets: new Map(state.sqlSets.sets),
            changed: action.changed,
            uneditedSets
        },
    });
};

export const setAdminUneditedConceptSqlSet = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            uneditedSets: new Map(action.mappedSets!)
        }
    });
};

export const undoAdminConceptSqlSetChanges = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    const savedOnly: Map<number, ConceptSqlSet> = new Map();
    state.sqlSets.uneditedSets!.forEach((s) => {
        savedOnly.set(s.id, Object.assign({}, s))
    });

    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            sets: savedOnly,
            changed: false
        }
    });
};

export const deleteAdminConceptSqlSet = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    const set = action.set!;
    state.sqlSets.uneditedSets!.delete(set.id);
    state.sqlSets.sets.delete(set.id);

    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            sets: new Map(state.sqlSets.sets),
            changed: conceptSqlSetsChanged(state.sqlSets.sets)
        }
    });
};

export const setAdminConceptSqlSetUnchanged = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            changed: false,
            uneditedSets: new Map(state.sqlSets.sets)
        }
    });
};

export const syncAdminConceptSqlSetUnsavedWithSaved = (state: AdminState, action: AdminSqlSetAction): AdminState => {
    const prev = action.prevSqlSet!;
    const set = action.set!;

    state.sqlSets.uneditedSets!.delete(prev.id);
    state.sqlSets.uneditedSets!.set(set.id, set);
    state.sqlSets.sets.delete(prev.id);
    state.sqlSets.sets.set(set.id, set);

    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            sets: new Map(state.sqlSets.sets),
            uneditedSets: new Map(state.sqlSets.uneditedSets!)
        }
    });
};