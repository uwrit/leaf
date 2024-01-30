/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
import { DefTemplates } from '../../models/patientList/DatasetDefinitionTemplate';
import { PatientListDatasetShape } from '../../models/patientList/Dataset';

const year = new Date().getFullYear();

interface BaseConceptProps {
    id: string,
    rootId: string,
    parentId: undefined | string,
    isNumeric: boolean,
    isParent: boolean,
    isRoot: boolean,
    isPatientCountAutoCalculated: boolean,
    isSpecializable: boolean,
    uiDisplayName: string,
    uiDisplayText: string,
    uiDisplaySubtext: string,
    uiDisplayTooltip: string,
    universalId: string,
    unsaved: boolean
}

/*
 * After an admin Concept is edited, copy and
 * transform a corresponding user Concept with
 * the changes if applicable.
 */
export const updateUserConceptFromAdminChange = (userConcept: any, propName: string, val: any, sqlSet?: ConceptSqlSet): UserConcept => {
    const neverAdd = new Set(['specializationGroups']);
    const alwaysAdd = new Set([ 
        'uiDisplaySubtext', 'uiDisplayPatientCount', 'uiNumericDefaultText', 'uiDisplayTooltip', 
        'uiDisplayName', 'uiDisplayText', 'isNumeric', 'isEncounterBased' 
    ]);
    const out = Object.assign({}, userConcept);

    if (sqlSet) {
        out.isEncounterBased = sqlSet.isEncounterBased;
    }
    if (propName === 'fhirResourceShapeId') {
        out.isEncounterBased = val !== PatientListDatasetShape.Person && val !== PatientListDatasetShape.Patient;
    }
    if (alwaysAdd.has(propName) || (userConcept[propName] !== undefined && !neverAdd.has(propName))) {
        out[propName] = val;
    }
    return  out;
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

export const createEmptyConcept = (currentAdminConcept?: AdminConcept): EmptyConceptPair => {
    const id = generateId();
    const baseProps: BaseConceptProps = {
        id,
        rootId: id,
        parentId: undefined,
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
    if (currentAdminConcept) {
        baseProps.rootId = currentAdminConcept.rootId;
        baseProps.isRoot = false;
        baseProps.parentId = currentAdminConcept.id;
    }
    let adminConcept: AdminConcept = {
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
        isOpen: false,
        specializationGroups: []
    };
    if (currentAdminConcept) {
        adminConcept.sqlSetId = currentAdminConcept.sqlSetId;
        adminConcept.sqlSetWhere = currentAdminConcept.sqlSetWhere;
    }

    return { adminConcept, userConcept };
};