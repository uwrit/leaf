/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept as AdminConcept, ConceptSqlSet, SpecializationGroup } from '../models/admin/Concept';
import { Concept as UserConcept } from '../models/concept/Concept';
import { SqlConfiguration } from '../models/admin/Configuration';
import formatSql from './formatSql';
import { AppState } from '../models/state/AppState';
import { saveOrUpdateAdminConceptSqlSet } from '../actions/admin/sqlSet';
import { saveOrUpdateAdminConceptSpecializationGroup } from '../actions/admin/specializationGroup';
import { saveOrUpdateAdminSpecialization } from '../actions/admin/specialization';

const year = new Date().getFullYear();

/*
 * After an admin Concept is edited, copy and
 * transform a corresponding user Concept with
 * the changes if applicable.
 */
export const updateUserConceptFromAdminChange = (userConcept: UserConcept, propName: string, val: any, sqlSet?: ConceptSqlSet): UserConcept => {
    const alwaysAdd = new Set([ 
        'uiDisplaySubtext', 'uiDisplayPatientCount', 'uiNumericDefaultText', 'uiDisplayTooltip', 
        'uiDisplayName', 'uiDisplayText', 'isNumeric', 'isEncounterBased' 
    ]);
    const out = Object.assign({}, userConcept);

    if (sqlSet) {
        out.isEncounterBased = sqlSet.isEncounterBased;
    }

    if (alwaysAdd.has(propName) || userConcept[propName] !== undefined) {
        out[propName] = val;
    }
    return out;
};

/*
 * Generate an example SQL statement based on current concept attributes.
 */
export const generateSampleSql = (concept: AdminConcept, sqlSet: ConceptSqlSet, config: SqlConfiguration): string => {
    if (!sqlSet || !config) { return ''; }
    const a = config.alias;
    const person = config.fieldPersonId;
    const where: string[] = [];
    let sql = 
        `SELECT ${a}.${person} ` +
        `FROM ${sqlSet.sqlSetFrom} AS ${a}`;

    if (concept.sqlSetWhere)                            { where.push(concept.sqlSetWhere); }
    if (sqlSet.isEncounterBased && sqlSet.sqlFieldDate) { where.push(`${sqlSet.sqlFieldDate} > '${year}-01-01'`); }
    if (concept.isNumeric && concept.sqlFieldNumeric)   { where.push(`${concept.sqlFieldNumeric} > 5`); }

    for (let i = 0; i < where.length; i++) {
        sql += (i === 0 ? ' WHERE ' : ' AND ') + where[i];
    }

    // Remove alias
    sql = sql.replace(new RegExp(a, 'g'), 'T');

    return formatSql(sql);
};

/*
 * Check if a concept is valid by checking for
 * errored inputs in the DOM. 
 * TODO: this is quite a flawed approach, make a proper
 * analysis method of the object in the future.
 */
export const conceptEditorValid = () => {
    const errors = document.querySelectorAll('.concept-editor .leaf-input.error');
    return errors.length === 0;
};

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