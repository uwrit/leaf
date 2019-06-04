import { AdminDatasetQuery } from "../../models/admin/Dataset";
import { AdminPanelLoadState } from "../../models/state/AdminState";
import { AppState } from "../../models/state/AppState";
import { InformationModalState, NoClickModalStates } from "../../models/state/GeneralUiState";
import { showInfoModal, setNoClickModalState } from "../generalUi";
import { PatientListDatasetQuery, PatientListDatasetShape } from "../../models/patientList/Dataset";
import { getAdminDataset, createDataset, updateDataset, deleteDataset, upsertDemographicsDataset } from "../../services/admin/datasetApi";
import { indexDatasets, searchDatasets } from "../../services/datasetSearchApi";
import { setDataset, removeDataset, setDatasetSearchResult } from "../datasets";

export const SET_ADMIN_DATASET = 'SET_ADMIN_DATASET';
export const SET_ADMIN_DATASET_SQL = 'SET_ADMIN_DATASET_SQL';
export const SET_ADMIN_DATASET_SHAPE = 'SET_ADMIN_DATASET_SHAPE';
export const SET_ADMIN_DEMOGRAPHICS_DATASET = 'SET_ADMIN_DEMOGRAPHICS_DATASET';
export const SET_ADMIN_PANEL_DATASET_LOAD_STATE = 'SET_ADMIN_PANEL_DATASET_LOAD_STATE';
export const REMOVE_ADMIN_DATASET = 'REMOVE_ADMIN_DATASET';

export interface AdminDatasetAction {
    changed?: boolean;
    dataset?: AdminDatasetQuery;
    shape?: PatientListDatasetShape;
    sql?: string;
    state?: AdminPanelLoadState;
    type: string;
}

// Asynchronous
/*
 * Saves a new Dataset.
 */
export const saveAdminDataset = (dataset: AdminDatasetQuery) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NoClickModalStates.CallingServer }));
            const newAdminDataset = dataset.unsaved
                ? await createDataset(state, dataset)
                : await updateDataset(state, dataset);
            dispatch(setAdminDataset(newAdminDataset, false));

            /*
             * Reindex search engine.
             */
            const datasets: PatientListDatasetQuery[] = [];
            const userDataset = deriveUserDatasetFromAdmin(state, dataset);

            state.datasets.allMap.set(dataset.id, userDataset);
            state.datasets.allMap.forEach((ds) => datasets.push(ds));
            await indexDatasets(datasets);
            dispatch(setDataset(userDataset));
            dispatch(setNoClickModalState({ message: "Saved", state: NoClickModalStates.Complete }));
        } catch (err) {
            console.log(err);
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            const info: InformationModalState = {
                body: "An error occurred while attempting to save the Dataset. Please see the Leaf error logs for details.",
                header: "Error Saving Dataset",
                show: true
            };
            dispatch(showInfoModal(info));
        }
    }
};

/*
 * Saves the current demographics dataset.
 */
export const saveAdminDemographicsDataset = (dataset: AdminDatasetQuery) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        try {
            dispatch(setNoClickModalState({ message: "Saving", state: NoClickModalStates.CallingServer }));
            const newAdminDataset = await upsertDemographicsDataset(state, dataset);
            dispatch(setAdminDemographicsDataset(newAdminDataset, false));
            dispatch(setNoClickModalState({ message: "Saved", state: NoClickModalStates.Complete }));
        } catch (err) {
            console.log(err);
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            const info: InformationModalState = {
                body: "An error occurred while attempting to save the Dataset. Please see the Leaf error logs for details.",
                header: "Error Saving Dataset",
                show: true
            };
            dispatch(showInfoModal(info));
        }
    }
};

/*
 * Delete a existing concept.
 */
export const deleteAdminDataset = (dataset: AdminDatasetQuery) => {
    return async (dispatch: any, getState: () => AppState) => {
        let state = getState();
        dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
        deleteDataset(state, dataset)
            .then(
                async (response) => {
                    const userDataset = deriveUserDatasetFromAdmin(state, dataset);
                    dispatch(removeDataset(userDataset));
                    state = getState();

                    const datasets: PatientListDatasetQuery[] = [];
                    state.datasets.allMap.forEach((ds) => datasets.push(ds));
                    await indexDatasets(datasets);
                    dispatch(setAdminDataset(undefined, false));
                    dispatch(setNoClickModalState({ message: "Dataset Deleted", state: NoClickModalStates.Complete }));
                }, error => {
                    const info: InformationModalState = {
                        body: "An error occurred while attempting to delete the Dataset. Please see the Leaf error logs for details.",
                        header: "Error Deleting Dataset",
                        show: true
                    };
                    dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                    dispatch(showInfoModal(info));
                }
            );
        
    }
};

/*
 * Fetch admin datatset if it hasn't already been loaded.
 */
export const fetchAdminDatasetIfNeeded = (dataset: PatientListDatasetQuery) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        try {

            /*
             * Don't request from server if this is a newly-created Dataset.
             */
            if (dataset.unsaved) { return; }
            const adm = state.admin!.datasets;

            /*
             * If demographics, set that and short-circuit.
             */
            if (dataset.shape === PatientListDatasetShape.Demographics) {
                dispatch(setAdminDataset(state.admin!.datasets.demographicsDataset, false));
                return;
            }

            /*
             * Try to load from local cache.
             */ 
            let admDataset = adm.datasets.get(dataset.id);

            /*
            * If not previously loaded, fetch from server.
            */ 
            if (!admDataset) {
                dispatch(setAdminPanelDatasetLoadState(AdminPanelLoadState.LOADING));
                admDataset = await getAdminDataset(state, dataset.id);
            } 
            dispatch(setAdminDataset(admDataset!, false));
            dispatch(setAdminPanelDatasetLoadState(AdminPanelLoadState.LOADED));
        } catch (err) {
            const info : InformationModalState = {
                header: "Error Loading Dataset",
                body: "Leaf encountered an error while attempting to fetch a Dataset. Check the Leaf log file for details.",
                show: true
            }
            dispatch(showInfoModal(info));
            dispatch(setAdminPanelDatasetLoadState(AdminPanelLoadState.ERROR));
        }
    };
};

export const revertAdminDatasetChanges = (dataset: AdminDatasetQuery) => {
    return async (dispatch: any, getState: () => AppState) => {
        let state = getState();
        const { currentDataset, datasets, demographicsDataset } = state.admin!.datasets;

        if (currentDataset!.shape === PatientListDatasetShape.Demographics) {
            dispatch(setAdminDataset(demographicsDataset, false));
        } else {
            dispatch(setNoClickModalState({ message: "Undoing", state: NoClickModalStates.CallingServer }));
            const originalAdminDataset = datasets.get(dataset.id)!;
            const userDataset = deriveUserDatasetFromAdmin(state, originalAdminDataset);
            const results = await searchDatasets(state.datasets.searchTerm);

            if (dataset.unsaved) {
                dispatch(setAdminDataset(undefined, false));
                dispatch(removeDataset(userDataset));
            } else {
                dispatch(setAdminDataset(originalAdminDataset, false));
                dispatch(setDataset(userDataset));
            }
            dispatch(removeAdminDataset(dataset));
            dispatch(setDatasetSearchResult(results));
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
        }
    };
};

// Synchonous
export const setAdminDataset = (dataset: AdminDatasetQuery | undefined, changed: boolean): AdminDatasetAction => {
    return {
        dataset,
        changed,
        type: SET_ADMIN_DATASET
    };
};

export const removeAdminDataset = (dataset: AdminDatasetQuery): AdminDatasetAction => {
    return {
        dataset,
        type: REMOVE_ADMIN_DATASET
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

export const setAdminDemographicsDataset = (dataset: AdminDatasetQuery, changed: boolean): AdminDatasetAction => {
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

const deriveUserDatasetFromAdmin = (state: AppState, dataset: AdminDatasetQuery): PatientListDatasetQuery => {
    return {
        ...dataset,
        category: Boolean(dataset.categoryId)
            ? state.admin!.datasetQueryCategories.categories.get(dataset.categoryId!)!.category 
            : ''
    }
};