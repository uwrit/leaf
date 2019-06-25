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
import { DefTemplates, DemographicsAdminSqlDefTemplate } from "../../models/patientList/DatasetDefinitionTemplate";
import { getSqlColumns } from "../../utils/parseSql";

const personId = 'personId';

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
        const cols = getShapeColumns(ds.sqlStatement, ds.shape);
        expectedColumns = cols.expectedColumns;
        sqlColumns = cols.sqlColumns;

        if (ds.shape !== PatientListDatasetShape.Demographics) {
            datasets.datasets.set(ds.id, ds);
        }
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
    const { expectedColumns, sqlColumns } = getShapeColumns(ds.sqlStatement, action.shape!);

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
    const sqlColumns = new Set(getSqlColumns(action.sql!));
    datasets.expectedColumns.forEach((c) => c.present = sqlColumns.has(c.id));

    return Object.assign({}, state, { 
        datasets: { 
            ...state.datasets,
            changed: true,
            currentDataset: ds,
            sqlColumns
        }
    });
};

const getShapeColumns = (sql: string, shape: PatientListDatasetShape) => {
    const template = shape === PatientListDatasetShape.Demographics
        ? DemographicsAdminSqlDefTemplate
        : DefTemplates.get(shape);
    const sqlColumns = new Set(getSqlColumns(sql));
    const expectedColumns: AdminPanelPatientListColumnTemplate[] = [
        { id: personId, type: PatientListColumnType.string, present: sqlColumns.has(personId) }
    ];

    if (shape !== PatientListDatasetShape.Dynamic) {
        template!.columns.forEach((c) => expectedColumns.push({ ...c, present: sqlColumns.has(c.id) }));
    }
    return { expectedColumns, sqlColumns };
} 