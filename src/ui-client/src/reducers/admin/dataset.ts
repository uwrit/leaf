/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminDatasetAction } from "../../actions/admin/dataset";
import { AdminPanelPatientListColumnTemplate, PatientListColumnType } from "../../models/patientList/Column";
import { AdminDatasetQuery } from "../../models/admin/Dataset";
import { PatientListDatasetShape } from "../../models/patientList/Dataset";
import { DefTemplates, DemographicsAdminSqlDefTemplate, personId } from "../../models/patientList/DatasetDefinitionTemplate";
import { getSqlColumns } from "../../utils/parseSql";
import { getDynamicSchema } from "./dynamicDataset";

export const setAdminPanelDatasetLoadState = (state: AdminState, action: AdminDatasetAction): AdminState => {
    return Object.assign({}, state, { 
        datasets: { 
            ...state.datasets,
            state: action.state
        }
    });
};

export const removeAdminPanelDataset = (state: AdminState, action: AdminDatasetAction): AdminState => {
    const datasets = state.datasets;
    datasets.datasets.delete(action.dataset!.id);
    
    return Object.assign({}, state, { 
        datasets: { 
            ...state.datasets,
            datasets: new Map(datasets.datasets),
        }
    });
}

export const setAdminPanelCurrentDataset = (state: AdminState, action: AdminDatasetAction): AdminState => {
    const datasets = state.datasets;
    const ds = action.dataset as AdminDatasetQuery;
    let expectedColumns = datasets.expectedColumns;
    let sqlColumns = datasets.sqlColumns;

    if (ds && action.analyzeColumns) {
        if (ds.shape === PatientListDatasetShape.Dynamic) {

            /*
             * Validate and set dynamic schema.
             */
            const dynSchema = getDynamicSchema(ds);
            sqlColumns = dynSchema.sqlColumns;
            ds.schema = dynSchema.schema;
            ds.sqlFieldDate = dynSchema.sqlFieldDate;
            ds.sqlFieldValueString = dynSchema.sqlFieldValueString;
            ds.sqlFieldValueNumeric = dynSchema.sqlFieldValueNumeric;

        } else {

            /*
             * Set and checked templated columns.
             */
            const cols = getShapeColumns(ds);
            expectedColumns = cols.expectedColumns;
            sqlColumns = cols.sqlColumns;
        }
    }
    if (ds && ds.shape !== PatientListDatasetShape.Demographics) {
        datasets.datasets.set(ds.id, ds);
    }

    return Object.assign({}, state, { 
        datasets: { 
            ...state.datasets,
            changed: action.changed,
            currentDataset: action.dataset,
            datasets: datasets.datasets,
            expectedColumns,
            sqlColumns
        }
    });
};

export const setAdminPanelDemographicsDataset = (state: AdminState, action: AdminDatasetAction): AdminState => {
    return Object.assign({}, state, { 
        datasets: { 
            ...state.datasets,
            changed: action.changed,
            demographicsDataset: action.dataset
        }
    });
};

export const setAdminPanelDatasetShape = (state: AdminState, action: AdminDatasetAction): AdminState => {
    const datasets = state.datasets;
    const ds = Object.assign({}, datasets.currentDataset, { shape: action.shape }) as AdminDatasetQuery;
    const { expectedColumns, sqlColumns } = getShapeColumns(ds);

    return Object.assign({}, state, { 
        datasets: { 
            ...state.datasets,
            changed: true,
            currentDataset: ds,
            expectedColumns,
            sqlColumns
        }
    });
};

export const setAdminPanelDatasetSql = (state: AdminState, action: AdminDatasetAction): AdminState => {
    const datasets = state.datasets;
    const ds = Object.assign({}, datasets.currentDataset, { sqlStatement: action.sql }) as AdminDatasetQuery;
    let sqlColumns = new Set();

    if (ds.shape === PatientListDatasetShape.Dynamic) {

        /*
         * Validate and set dynamic schema.
         */
        const dynSchema = getDynamicSchema(ds);
        sqlColumns = dynSchema.sqlColumns;
        ds.schema = dynSchema.schema;
        ds.sqlFieldDate = dynSchema.sqlFieldDate;
        ds.sqlFieldValueString = dynSchema.sqlFieldValueString;
        ds.sqlFieldValueNumeric = dynSchema.sqlFieldValueNumeric;

    } else {

        /*
         * Set and checked templated columns.
         */
        const cols = getShapeColumns(ds);
        sqlColumns = cols.sqlColumns;
        datasets.expectedColumns.forEach((c) => c.present = sqlColumns.has(c.id));
    }

    return Object.assign({}, state, { 
        datasets: { 
            ...state.datasets,
            changed: true,
            currentDataset: ds,
            sqlColumns
        }
    });
};

const getShapeColumns = (dataset: AdminDatasetQuery) => {
    const sqlColumns = new Set(getSqlColumns(dataset.sqlStatement));
    const expectedColumns: AdminPanelPatientListColumnTemplate[] = [ { id: personId, type: PatientListColumnType.String, present: sqlColumns.has(personId) } ];
    const template = dataset.shape === PatientListDatasetShape.Demographics ? DemographicsAdminSqlDefTemplate : DefTemplates.get(dataset.shape);

    if (dataset.shape !== PatientListDatasetShape.Dynamic) {
        template!.columns.forEach((c) => expectedColumns.push({ ...c, present: sqlColumns.has(c.id) }));
    }
    return { expectedColumns, sqlColumns };
};