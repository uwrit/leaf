/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminDatasetAction } from "../../actions/admin/dataset";
import { AdminPanelPatientListColumnTemplate } from "../../models/patientList/Column";
import { AdminDatasetQuery } from "../../models/admin/Dataset";

export const setAdminPanelDatasetLoadState = (state: AdminState, action: AdminDatasetAction): AdminState => {
    return Object.assign({}, state, { 
        datasets: { 
            ...state.datasets,
            state: action.state
        }
    });
};

export const setAdminPanelCurrentDataset = (state: AdminState, action: AdminDatasetAction): AdminState => {
    const datasets = state.datasets.datasets;
    const ds = action.dataset! as AdminDatasetQuery;
    datasets.set(ds.id, ds);

    return Object.assign({}, state, { 
        datasets: { 
            ...state.datasets,
            changed: action.changed,
            currentDataset: action.dataset,
            datasets
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

export const setAdminPanelDatasetColumns = (state: AdminState, action: AdminDatasetAction): AdminState => {
    return Object.assign({}, state, { 
        datasets: { 
            ...state.datasets,
            columns: action.columns
        }
    });
};

const setColumnsPresent = (sql: string, cols: AdminPanelPatientListColumnTemplate[]): AdminPanelPatientListColumnTemplate[] => {
    if (!sql) { return cols; }

    for (const col of cols) {
        if (sql.indexOf(col.id) > -1) {
            col.present = true;
        }
    }
    return cols;
};