/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { ConceptSqlSet, SpecializationGroup } from '../../models/admin/Concept';
import { AppState } from '../../models/state/AppState';
import { saveOrUpdateAdminConceptSqlSet } from '../../actions/admin/sqlSet';
import { saveOrUpdateAdminConceptSpecializationGroup } from '../../actions/admin/specializationGroup';
import { saveOrUpdateAdminSpecialization } from '../../actions/admin/specialization';

/*
 * Check if there are any changes to a ConceptSqlSet.
 * Note that because calling 'return' in Map.forEach doesn't
 * actually finish the function (as it does in a normal 
 * array), the method unfortunately has to run through
 * all elements before returning the result.
 */
export const conceptSqlSetsChanged = (sets: Map<number,ConceptSqlSet>): boolean => {
    let changeDetected = false;

    sets.forEach((set): any => {
        if (set.unsaved || set.changed) {
            changeDetected = true;
        }
        set.specializationGroups.forEach((grp): any => {
            if (grp.unsaved || grp.changed) {
                changeDetected = true;
            }
            grp.specializations.forEach((s): any => {
                if (s.unsaved || s.changed) {
                    changeDetected = true;
                }
            });
        });
    });
    return changeDetected;
};

export const getApiUpdateQueue = (sets: Map<number,ConceptSqlSet>, dispatch: any, state: AppState): any[] => {
    const queue: any[] = [];
    sets.forEach((set) => {
        if (set.unsaved || set.changed) {
            queue.push( async () => {

                // Get any Specialization Groups in the SQL Set
                const grps: SpecializationGroup[] = [];
                set.specializationGroups.forEach((grp) => grps.push(grp));

                // Save the Concept SQL Set.
                const newSet = await saveOrUpdateAdminConceptSqlSet(set, dispatch, state);

                // Loop through Specialization Groups within the set.
                for (const grp of grps) {

                    // Update the SqlSetId and save the Specialialization Group.
                    grp.sqlSetId = newSet.id;
                    await saveOrUpdateAdminConceptSpecializationGroup(grp, dispatch, state);
                }
            });
        } else {
            set.specializationGroups.forEach( async (grp) => {

                // Save the Specialialization Group if unsaved.
                if (grp.unsaved || grp.changed) {
                    queue.push(() => saveOrUpdateAdminConceptSpecializationGroup(grp, dispatch, state)); 
                } 
                
                // Loop through Specializations within the group.
                grp.specializations.forEach( async (spc) => {

                    // Save the Specialialization if unsaved.
                    if ((spc.unsaved || spc.changed) && !grp.unsaved) {
                        queue.push(() => saveOrUpdateAdminSpecialization(spc, dispatch, state));
                    }
                });
            });
        }
    });
    return queue;
};