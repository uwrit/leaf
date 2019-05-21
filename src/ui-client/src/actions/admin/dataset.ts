import { AdminDatasetQuery } from "../../models/admin/Dataset";
import { AdminPanelLoadState } from "../../models/state/AdminState";
import { AdminPanelPatientListColumnTemplate } from "../../models/patientList/Column";

export const SET_ADMIN_DATASET = 'SET_ADMIN_DATASET';
export const SET_ADMIN_PANEL_DATASET_LOAD_STATE = 'SET_ADMIN_PANEL_DATASET_LOAD_STATE';
export const SET_ADMIN_PANEL_DATASET_COLUMNS = 'SET_ADMIN_PANEL_DATASET_COLUMNS';

export interface AdminDatasetAction {
    changed?: boolean;
    columns?: AdminPanelPatientListColumnTemplate[];
    dataset?: AdminDatasetQuery;
    state?: AdminPanelLoadState;
    type: string;
}

// Synchonous
export const setAdminDataset = (dataset: AdminDatasetQuery, changed: boolean): AdminDatasetAction => {
    return {
        dataset,
        changed,
        type: SET_ADMIN_DATASET
    };
};

export const setAdminPanelDatasetLoadState = (state: AdminPanelLoadState): AdminDatasetAction => {
    return {
        state,
        type: SET_ADMIN_PANEL_DATASET_LOAD_STATE
    };
};

export const setAdminPanelDatasetColumns = (columns: AdminPanelPatientListColumnTemplate[]): AdminDatasetAction => {
    return {
        columns,
        type: SET_ADMIN_PANEL_DATASET_COLUMNS
    };
};