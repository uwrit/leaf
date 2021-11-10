/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PatientListColumnType } from "../../models/patientList/Column";
import { AdminDatasetQuery, DynamicDatasetQuerySchema, DynamicDatasetQuerySchemaField } from "../../models/admin/Dataset";
import { getSqlColumns } from "../../utils/parseSql";
import { personId, encounterId } from "../../models/patientList/DatasetDefinitionTemplate";

export const getDynamicSchema = (dataset: AdminDatasetQuery) => {
    const sqlColumns = new Set(getSqlColumns(dataset.sqlStatement));
    const schema = getDefaultDynamicSchema(dataset, sqlColumns);
    const excluded = new Set([ personId, encounterId ]);
    let prevSchema: Map<string, DynamicDatasetQuerySchemaField> = new Map();
    let sqlFieldDate = dataset.sqlFieldDate;
    let sqlFieldValueString = dataset.sqlFieldValueString;
    let sqlFieldValueNumeric = dataset.sqlFieldValueNumeric;

    /*
     *  New Column default props.
     */
    const required = true;
    const present = true;

    /*
     * Get previous schema, if any, and convert to a Map.
     */
    if (dataset.schema) {
        const mapCstor: any = dataset.schema.fields.map(f => [ f.name, f ]);
        prevSchema = new Map(mapCstor);
    }

    /*
     * Add columns, using previous if available.
     */
    sqlColumns.forEach(c => {
        if (c && !excluded.has(c)) {
            const prev = prevSchema.get(c);
            if (!prev) {
                const type = inferTypeFromName(c);
                const { mask, phi } = autoDeidentifyFromType(type);
                schema.fields.push({ name: c, type, phi, mask, required, present });
            } else {
                schema.fields.push(prev);
            }
        }
    });

    /*
     * Remove previously set sqlFields if they are no longer output from the SQL statement.
     */
    if (dataset.sqlFieldDate && !sqlColumns.has(dataset.sqlFieldDate))                 { sqlFieldDate = ""; }
    if (dataset.sqlFieldValueString && !sqlColumns.has(dataset.sqlFieldValueString))   { sqlFieldValueString = ""; }
    if (dataset.sqlFieldValueNumeric && !sqlColumns.has(dataset.sqlFieldValueNumeric)) { sqlFieldValueNumeric = ""; }

    return { schema, sqlColumns, sqlFieldDate, sqlFieldValueString, sqlFieldValueNumeric };
};

const autoDeidentifyFromType = (type: PatientListColumnType) => {
    if (type === PatientListColumnType.DateTime) {
        return { mask: true, phi: true };
    }
    return { mask: false, phi: false };
};

const inferTypeFromName = (name: string): PatientListColumnType => {
    var n = name.toLowerCase();
    if (n.indexOf('date') > -1)  { return PatientListColumnType.DateTime; }
    if (n.indexOf('time') > -1)  { return PatientListColumnType.DateTime; }
    if (n.indexOf('num') > -1)   { return PatientListColumnType.Numeric; }
    if (n.indexOf('quant') > -1) { return PatientListColumnType.Numeric; }
    if (n.startsWith('is'))      { return PatientListColumnType.Bool; }
    return PatientListColumnType.String;
};

const getDefaultDynamicSchema = (dataset: AdminDatasetQuery, sqlColumns: Set<string>) => {
    const schema: DynamicDatasetQuerySchema = { fields: [
        { 
            name: personId, 
            type: PatientListColumnType.String, 
            phi: true, 
            mask: true, 
            required: true, 
            present: sqlColumns.has(personId) 
        }
    ]};
    if (dataset.isEncounterBased) {
        schema.fields.push(
            { 
                name: encounterId, 
                type: PatientListColumnType.String, 
                phi: true, 
                mask: true, 
                required: true, 
                present: sqlColumns.has(encounterId) 
            }
        );
    }
    return schema;
};