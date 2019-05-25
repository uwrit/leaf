import { AdminDatasetQuery, AdminDemographicsDatasetQuery } from "../../models/admin/Dataset";
import { AdminPanelLoadState } from "../../models/state/AdminState";
import { AppState } from "../../models/state/AppState";
import { InformationModalState } from "../../models/state/GeneralUiState";
import { showInfoModal } from "../generalUi";
import { setAdminPanelConceptLoadState } from "./concept";
import { PatientListDatasetQueryDTO, PatientListDatasetShape } from "../../models/patientList/Dataset";
import { getAdminDataset } from "../../services/admin/datasetApi";

export const SET_ADMIN_DATASET = 'SET_ADMIN_DATASET';
export const SET_ADMIN_DATASET_SQL = 'SET_ADMIN_DATASET_SQL';
export const SET_ADMIN_DATASET_SHAPE = 'SET_ADMIN_DATASET_SHAPE';
export const SET_ADMIN_DEMOGRAPHICS_DATASET = 'SET_ADMIN_DEMOGRAPHICS_DATASET';
export const SET_ADMIN_PANEL_DATASET_LOAD_STATE = 'SET_ADMIN_PANEL_DATASET_LOAD_STATE';

export interface AdminDatasetAction {
    changed?: boolean;
    dataset?: AdminDatasetQuery | AdminDemographicsDatasetQuery;
    shape?: PatientListDatasetShape;
    sql?: string;
    state?: AdminPanelLoadState;
    type: string;
}

// Asynchronous
/*
 * Fetch admin datatset if it hasn't already been loaded.
 */
export const fetchAdminDatasetIfNeeded = (dataset: PatientListDatasetQueryDTO) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {

            /*
             * Don't request from server if this is a newly-created Dataset.
             */
            if (dataset.unsaved) { return; }
            const adm = state.admin!.datasets;

            /*
             * Try to load from local cache.
             */ 
            let admDataset = adm.datasets.get(dataset.id);

            /*
            * If not previously loaded, fetch from server.
            */ 
            if (!admDataset) {
                dispatch(setAdminPanelConceptLoadState(AdminPanelLoadState.LOADING));
                admDataset = await getAdminDataset(state, dataset.id);
            } 
            dispatch(setAdminDataset(admDataset!, false));
        } catch (err) {
            const info : InformationModalState = {
                header: "Error Loading Dataset",
                body: "Leaf encountered an error while attempting to fetch a Dataset. Check the Leaf log file for details.",
                show: true
            }
            dispatch(showInfoModal(info));
            dispatch(setAdminPanelConceptLoadState(AdminPanelLoadState.ERROR));
        }
    };
};

// Synchonous
export const setAdminDataset = (dataset: AdminDatasetQuery, changed: boolean): AdminDatasetAction => {
    return {
        dataset,
        changed,
        type: SET_ADMIN_DATASET
    };
};

export const setAdminDatasetShape = (shape: PatientListDatasetShape): AdminDatasetAction => {
    return {
        shape,
        type: SET_ADMIN_DATASET_SHAPE
    };
};

export const setAdminDatasetSql = (sql: string): AdminDatasetAction => {
    return {
        sql,
        type: SET_ADMIN_DATASET_SQL
    };
};

export const setAdminDemographicsDataset = (dataset: AdminDemographicsDatasetQuery, changed: boolean): AdminDatasetAction => {
    return {
        dataset,
        changed,
        type: SET_ADMIN_DEMOGRAPHICS_DATASET
    };
};

export const setAdminPanelDatasetLoadState = (state: AdminPanelLoadState): AdminDatasetAction => {
    return {
        state,
        type: SET_ADMIN_PANEL_DATASET_LOAD_STATE
    };
};