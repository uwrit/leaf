/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminSpecializationGroupAction } from "../../actions/admin/specializationGroup";
import { conceptSqlSetsChanged } from "../../utils/admin/sqlSet";

export const setAdminConceptSpecializationGroups = (state: AdminState, action: AdminSpecializationGroupAction) => {
    const groups = action.groups!;
    for (const grp of groups) {
        const set = state.sqlSets.sets.get(grp.sqlSetId);
        if (set) {
            const newSet = Object.assign({}, set, { specializationGroups: new Map(set.specializationGroups) });
            newSet.specializationGroups.set(grp.id, grp);
            state.sqlSets.sets.set(newSet.id, newSet);
        }
    }
    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            changed: true
        }
    });
};

export const removeAdminConceptSpecializationGroup = (state: AdminState, action: AdminSpecializationGroupAction) => {
    const grp = action.group!;
    const set = state.sqlSets.sets.get(grp.sqlSetId);
    const uneditedSet = state.sqlSets.uneditedSets!.get(grp.sqlSetId);

    if (uneditedSet) {
        uneditedSet.specializationGroups.delete(grp.id);
    }

    if (set) {
        set.specializationGroups = new Map(set.specializationGroups);
        set.specializationGroups.delete(grp.id);
    }

    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            changed: conceptSqlSetsChanged(state.sqlSets.sets)
        }
    });
};

export const syncAdminConceptSpecializationGroupUnsavedWithSaved = (state: AdminState, action: AdminSpecializationGroupAction): AdminState => {
    const prev = action.prevGroup!;
    const group = action.group!;

    const uneditedPrevSet = state.sqlSets.uneditedSets!.get(prev.sqlSetId);
    const set = state.sqlSets.sets.get(group.sqlSetId);

    if (uneditedPrevSet) {
        const newUneditedSet = Object.assign({}, uneditedPrevSet, { specializationGroups: new Map(uneditedPrevSet.specializationGroups) });
        newUneditedSet.specializationGroups.delete(prev.id);
        newUneditedSet.specializationGroups.set(group.id, group);
        state.sqlSets.uneditedSets!.set(newUneditedSet.id, newUneditedSet);
    }
    if (set) {
        const newSet = Object.assign({}, set, { specializationGroups: new Map(set.specializationGroups) });
        newSet.specializationGroups.delete(prev.id);
        newSet.specializationGroups.set(group.id, group);
        state.sqlSets.sets.set(newSet.id, newSet);
    }

    return Object.assign({}, state);
};