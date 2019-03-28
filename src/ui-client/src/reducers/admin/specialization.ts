/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminSpecializationAction } from "../../actions/admin/specialization";

export const setAdminConceptSpecialization = (state: AdminState, action: AdminSpecializationAction) => {
    const spcs = action.spcs!;
    for (const spc of spcs) {
        const set = state.sqlSets.sets.get(spc.sqlSetId); // state.specializationGroups.groups.get(spc.specializationGroupId);
        if (set) {
            const grp = set.specializationGroups.get(spc.specializationGroupId);
            if (grp) {
                grp.specializations.set(spc.id, spc);
            }
        }
    }
    return Object.assign({}, state, {
        specializationGroups: {
            ...state.specializationGroups,
            specializationChanged: action.changed
        }
    });
};

export const setAdminCurrentConceptSpecialization = (state: AdminState, action: AdminSpecializationAction) => {
    return Object.assign({}, state, {
        specializationGroups: {
            ...state.specializationGroups,
            currentSpecialization: action.spc
        }
    });
};

export const setAdminUneditedConceptSpecialization = (state: AdminState, action: AdminSpecializationAction) => {
    return Object.assign({}, state, {
        specializationGroups: {
            ...state.specializationGroups,
            uneditedSpecialization: action.spc
        }
    });
};

export const removeAdminConceptSpecialization = (state: AdminState, action: AdminSpecializationAction) => {
    const spc = action.spc!;
    const set = state.sqlSets.sets.get(spc.sqlSetId);
        if (set) {
            const grp = set.specializationGroups.get(spc.specializationGroupId);
            if (grp) {
                grp.specializations.delete(spc.id);
            }
        }
    return Object.assign({}, state);
};
