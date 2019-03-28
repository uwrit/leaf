/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept as AdminConcept, ConceptSqlSet } from '../models/admin/Concept';
import { Concept } from '../models/concept/Concept';
import { SqlConfiguration } from '../models/admin/Configuration';
import formatSql from './formatSql';

const year = new Date().getFullYear();

export const adminToNormalConcept = (admConcept: AdminConcept, concept: Concept): Concept => {
    const admProps = Object.keys(admConcept);
    const normProps = new Set(Object.keys(concept));
    const alwaysAdd = new Set([ 'uiDisplaySubtext', 'uiDisplayPatientCount', 'uiNumericDefaultText', 'uiDisplayTooltip', 'uiDisplayName', 'uiDisplayText', 'isNumeric' ]);
    let outConcept: any = { };

    for (const admProp of admProps) {
        if (normProps.has(admProp) || alwaysAdd.has(admProp)) {
            outConcept[admProp] = admConcept[admProp];
        }
    }
    return outConcept;
};

export const generateSampleSql = (concept: AdminConcept, sqlSet: ConceptSqlSet, config: SqlConfiguration): string => {
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