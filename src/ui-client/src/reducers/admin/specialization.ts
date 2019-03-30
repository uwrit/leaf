/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminSpecializationAction } from "../../actions/admin/specialization";
import { conceptSqlSetsChanged } from "../../utils/admin";

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
        if (set) {
            set.specializationGroups = new Map(set.specializationGroups);
            const grp = set.specializationGroups.get(spc.specializationGroupId);
            if (grp) {
                grp.specializations = new Map(grp.specializations);
                grp.specializations.delete(spc.id);
            }
        }
    return Object.assign({}, state, {
        sqlSets: {
            ...state.sqlSets,
            changed: conceptSqlSetsChanged(state.sqlSets.sets)
        }
    });
};
