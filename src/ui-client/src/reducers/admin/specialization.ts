/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminSpecializationAction } from "../../actions/admin/specialization";
import { conceptSqlSetsChanged } from "../../utils/admin/sqlSet";

export const setAdminConceptSpecialization = (state: AdminState, action: AdminSpecializationAction) => {
    const spcs = action.spcs!;
    for (const spc of spcs) {
        const set = state.sqlSets.sets.get(spc.sqlSetId); 
        if (set) {
            const newSet = Object.assign({}, set, { specializationGroups: new Map(set.specializationGroups) });
            const grp = newSet.specializationGroups.get(spc.specializationGroupId);
            if (grp) {
                const newGrp = Object.assign({}, grp, { specializations: new Map(grp.specializations) });
                newGrp.specializations.set(spc.id, spc);
                newSet.specializationGroups.set(newGrp.id, newGrp);
            }
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

export const removeAdminConceptSpecialization = (state: AdminState, action: AdminSpecializationAction) => {
    const spc = action.spc!;
    const set = state.sqlSets.sets.get(spc.sqlSetId);
    const uneditedSet = state.sqlSets.uneditedSets!.get(spc.sqlSetId);

    if (uneditedSet) {
        const uneditedGrp = uneditedSet.specializationGroups.get(spc.specializationGroupId);
        if (uneditedGrp) {
            uneditedGrp.specializations.delete(spc.id);
        }
    }

    if (set) {
        const newSet = Object.assign({}, set, { specializationGroups: new Map(set.specializationGroups) });
        const grp = newSet.specializationGroups.get(spc.specializationGroupId);
        if (grp) {
            const newGrp = Object.assign({}, grp, { specializations: new Map(grp.specializations) });
            newGrp.specializations.delete(spc.id);
            newSet.specializationGroups.set(newGrp.id, newGrp);
            state.sqlSets.sets.set(newSet.id, newSet);
        }
    }

    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            changed: conceptSqlSetsChanged(state.sqlSets.sets)
        }
    });
};

export const syncAdminConceptSpecializationUnsavedWithSaved = (state: AdminState, action: AdminSpecializationAction): AdminState => {
    const prev = action.prevSpc!;
    const spc = action.spc!;

    const uneditedPrevSet = state.sqlSets.uneditedSets!.get(prev.sqlSetId);
    const set = state.sqlSets.sets.get(spc.sqlSetId);

    // Sync the 'unedited' set, group, and specialization if the user later clicks 'undo'
    if (uneditedPrevSet) {
        const newUneditedSet = Object.assign({}, uneditedPrevSet, { specializationGroups: new Map(uneditedPrevSet.specializationGroups) });
        const newUneditedGrp = newUneditedSet.specializationGroups.get(prev.specializationGroupId);
        
        if (newUneditedGrp) {
            const newUneditedSpcs = Object.assign({}, newUneditedGrp, { specializations: new Map(newUneditedGrp.specializations) });
            newUneditedSpcs.specializations.set(spc.id, Object.assign({}, spc));
            newUneditedSet.specializationGroups.set(newUneditedGrp.id, newUneditedGrp);
            state.sqlSets.uneditedSets!.set(newUneditedSet.id, newUneditedSet);    
        }
    }

    // Sync the current saved set, group, and specialization
    if (set) {
        const newSet = Object.assign({}, set, { specializationGroups: new Map(set.specializationGroups) });
        const newGrp = newSet.specializationGroups.get(spc.specializationGroupId);
        
        if (newGrp) {
            const newSpcs = Object.assign({}, newGrp, { specializations: new Map(newGrp.specializations) });
            newSpcs.specializations.set(spc.id, Object.assign({}, spc));
            newSet.specializationGroups.set(newGrp.id, newGrp);
            state.sqlSets.sets.set(newSet.id, newSet);    
        }
    }

    return Object.assign({}, state);
};