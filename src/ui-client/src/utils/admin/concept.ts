/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept as AdminConcept, ConceptSqlSet } from '../../models/admin/Concept';
import { Concept as UserConcept } from '../../models/concept/Concept';
import { SqlConfiguration } from '../../models/admin/Configuration';
import formatSql from '../formatSql';
import { generate as generateId } from 'shortid';

const year = new Date().getFullYear();

/*
 * After an admin Concept is edited, copy and
 * transform a corresponding user Concept with
 * the changes if applicable.
 */
export const updateUserConceptFromAdminChange = (userConcept: UserConcept, propName: string, val: any, sqlSet?: ConceptSqlSet): UserConcept => {
    const neverAdd = new Set(['specializationGroups']);
    const alwaysAdd = new Set([ 
        'uiDisplaySubtext', 'uiDisplayPatientCount', 'uiNumericDefaultText', 'uiDisplayTooltip', 
        'uiDisplayName', 'uiDisplayText', 'isNumeric', 'isEncounterBased' 
    ]);
    const out = Object.assign({}, userConcept);

    if (sqlSet) {
        out.isEncounterBased = sqlSet.isEncounterBased;
    }

    if (alwaysAdd.has(propName) || (userConcept[propName] !== undefined && !neverAdd.has(propName))) {
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
    const nl = `
    `;
    let sql = 
        `SELECT ${a}.${person} ` +
        `FROM ${sqlSet.sqlSetFrom} AS ${a}`;

    if (concept.sqlSetWhere)                            { where.push(concept.sqlSetWhere); }
    if (sqlSet.isEncounterBased && sqlSet.sqlFieldDate) { where.push(`${sqlSet.sqlFieldDate} > '${year}-01-01' -- Example date filter`); }
    if (concept.isNumeric && concept.sqlFieldNumeric)   { where.push(`${concept.sqlFieldNumeric} > 5 -- Example numeric filter`); }

    for (let i = 0; i < where.length; i++) {
        sql += (i === 0 ? ' WHERE ' : ' AND ') + where[i] + nl;
    }

    // Remove alias
    sql = sql.replace(new RegExp(a, 'g'), 'T');

    return formatSql(sql);
};

/*
 * Determines the rootId of a given Concept. Called before saving.
 */
export const getRootId = (concept: UserConcept, conceptTree: Map<string, UserConcept>) => {
    if (!concept.parentId) {
        return concept.id;
    }
    let parentId = concept.parentId;
    let rootId = parentId;
    while (parentId) {
        rootId = parentId;
        parentId = conceptTree.get(parentId)!.parentId!;
    }
    return rootId;
};

/* 
 * Return a new empty concept.
 */
export interface EmptyConceptPair {
    adminConcept: AdminConcept;
    userConcept: UserConcept;
}

export const createEmptyConcept = (): EmptyConceptPair => {
    const id = generateId();
    const baseProps = {
        id,
        rootId: id,
        isNumeric: false,
        isParent: false,
        isRoot: true,
        isPatientCountAutoCalculated: true,
        isSpecializable: false,
        uiDisplayName: 'New Concept',
        uiDisplayText: '',
        uiDisplaySubtext: '',
        uiDisplayTooltip: '',
        universalId: '',
        unsaved: true
    };
    const adminConcept: AdminConcept = {
        ...baseProps,
        constraints: [],
        specializationGroups: []
    };
    const userConcept: UserConcept = {
        ...baseProps,
        childrenLoaded: false,
        isEncounterBased: false,
        isEventBased: false,
        isFetching: false,
        isOpen: false
    };

    return { adminConcept, userConcept };
};