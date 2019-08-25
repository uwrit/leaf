/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Action, Dispatch } from 'redux';
import { AppState } from '../../models/state/AppState';
import { PatientListState, CohortStateType } from '../../models/state/CohortState';
import { NetworkIdentity } from '../../models/NetworkResponder';
import { fetchDataset } from '../../services/cohortApi';
import { addDemographicsDataset, addDataset, getPatients, removeDataset } from '../../services/patientListApi';
import { DateBoundary } from '../../models/panel/Date';
import { PatientListColumn } from '../../models/patientList/Column';
import { PatientListDatasetQuery, PatientListDatasetDefinition, PatientListDatasetShape } from '../../models/patientList/Dataset';
import { PatientListSort, PatientListSortType } from '../../models/patientList/Configuration';
import { PatientListRow, PatientListRowDTO } from '../../models/patientList/Patient';
import { allowDatasetInSearch } from '../../services/datasetSearchApi';
import { showInfoModal, setNoClickModalState } from '../generalUi';
import { InformationModalState, NotificationStates } from '../../models/state/GeneralUiState';
import { setDatasetSearchResult } from '../datasets';

// Cohort patient list actions
export const REQUEST_PATIENT_LIST_DATA = 'REQUEST_PATIENT_LIST_DATA';
export const RESET_PATIENT_LIST = 'RESET_PATIENT_LIST';
export const SET_PATIENT_LIST_DISPLAY = 'SET_PATIENT_LIST_DISPLAY';
export const SET_PATIENT_LIST_SORT = 'SET_PATIENT_LIST_SORT';
export const PATIENT_LIST_INTERACT_DISABLED = 'PATIENT_LIST_INTERACT_DISABLED';
export const REQUEST_CURRENT_PATIENT_LIST = 'REQUEST_CURRENT_PATIENT_LIST';

export const PATIENT_LIST_SINGLETON_RECEIVED = 'PATIENT_LIST_SINGLETON_RECEIVED';
export const PATIENT_LIST_DATASET_REQUESTED = 'PATIENT_LIST_DATASET_REQUESTED';
export const PATIENT_LIST_DATASET_RECEIVED = 'PATIENT_LIST_DATASET_RECEIVED';
export const PATIENT_LIST_NETWORK_DATASET_RECEIVED = 'PATIENT_LIST_NETWORK_DATASET_RECEIVED';
export const PATIENT_LIST_DATASET_FAILURE = 'PATIENT_LIST_DATASET_FAILURE';
export const PATIENT_LIST_DATASET_NOT_IMPLEMENTED = 'PATIENT_LIST_DATASET_NOT_IMPLEMENTED';
export const PATIENTLIST_COLUMN_TOGGLE = 'PATIENTLIST_COLUMN_TOGGLE';
export const PATIENTLIST_SET_PAGINATION = 'PATIENTLIST_SET_PAGINATION';
export const PATIENTLIST_ISOPEN_TOGGLE = 'PATIENTLIST_ISOPEN_TOGGLE';
export const PATIENTLIST_SET_AVAILABLE = 'PATIENTLIST_SET_AVAILABLE';

export interface CohortPatientListAction {
    id: number;
    column?: PatientListColumn;
    datasetId?: string;
    datasets?: PatientListDatasetQuery[];
    dates?: DateBoundary;
    patientList?: PatientListState;
    rowCount?: number;
    rowId?: number;
    sort?: PatientListSort;
    error?: string;
    type: string;
}

/*
 * Switch array positions between two indexes.
 */
const switchArrayPositions = (arr: any[], oldIdx: number, newIdx: number) => {
    while (oldIdx < 0) { oldIdx += arr.length; }
    while (newIdx < 0) { newIdx += arr.length; }
    if (newIdx >= arr.length) {
        let k = newIdx - arr.length + 1;
        while (k--) { arr.push(undefined); }
    }
    arr.splice(newIdx, 0, arr.splice(oldIdx, 1)[0]);
    return arr;
};

// Asynchronous
/*
 * Request a patient list dataset from each responder which is 
 * enabled and has loaded demographics.
 */
export const getPatientListDataset = (dataset: PatientListDatasetQuery, dates: DateBoundary) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        const responders: NetworkIdentity[] = [];
        let atLeastOneSucceeded = false;
        
        state.responders.forEach((nr: NetworkIdentity) => { 
            const crt = state.cohort.networkCohorts.get(nr.id)!;
            if (nr.enabled && 
                (
                    (nr.isHomeNode && !nr.isGateway) || !nr.isHomeNode
                ) &&
                crt.count.state === CohortStateType.LOADED && 
                crt.patientList.state === CohortStateType.LOADED
            ) { 
                responders.push(nr); 
            } 
        });
        dispatch(setPatientListDatasetRequested(dataset.id));

        Promise.all(responders.map((nr: NetworkIdentity, i: number) => { 
            return new Promise( async (resolve, reject) => {
                try {
                    if (nr.isHomeNode || (dataset.universalId && dataset.shape !== PatientListDatasetShape.Dynamic)) {
                        const queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;
                        const ds = await fetchDataset(state, nr, queryId, dataset, dates);
                        const newPl = await addDataset(getState, ds, dataset, nr.id);
                        atLeastOneSucceeded = true;
                        newPl.configuration.displayColumns.forEach((c: PatientListColumn, i: number) => c.index = i);
                        dispatch(setPatientListNetworkDatasetReceived(nr.id, dataset.id));
                        dispatch(setPatientListDisplay(newPl));
                    } else {
                        dispatch(setPatientListDatasetNotImplemented(dataset.id, nr.id))
                    }
                } catch (err) {
                    dispatch(setPatientListDatasetFailure(dataset.id, nr.id));
                    console.log(err);
                }
                resolve();
            });
        }))
        .then( async () => {
            if (atLeastOneSucceeded) {
                const visibleDatasets = await allowDatasetInSearch(dataset.id, false, state.datasets.searchTerm);
                dispatch(setDatasetSearchResult(visibleDatasets));
            } else {
                const info: InformationModalState = {
                    body: "Leaf encountered an error when attempting to load this dataset. Please contact your Leaf administrator with this information.",
                    header: "Error Loading Dataset",
                    show: true
                };
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                dispatch(showInfoModal(info));
            }
        })
        .then(() => dispatch(setPatientListDatasetReceived(dataset.id, dates)))
        .catch(() => dispatch(setPatientListDatasetFailure(dataset.id, 0)));
    };
};

/*
 * Removes a dataset from the patient list.
 */
export const deleteDataset = (def: PatientListDatasetDefinition) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState();
        const newPl = Object.assign({}, state.cohort.patientList);
        if (def.totalRows) {
            newPl.totalRows -= def.totalRows!;
        }
        
        newPl.configuration.displayColumns = newPl.configuration.displayColumns.filter((col: PatientListColumn) => col.datasetId !== def.id);
        newPl.configuration.multirowDatasets.delete(def.id);
        newPl.configuration.singletonDatasets.delete(def.id);
        newPl.display = await removeDataset(newPl.configuration, def) as PatientListRow[];
        const newDatasets = await allowDatasetInSearch(def.id, true, state.datasets.searchTerm);
        dispatch(setDatasetSearchResult(newDatasets));
        dispatch(setPatientListDisplay(newPl));
    };
};

/*
 * Adds a responder's base demographic dataset.
 */
export const getPatientListFromNewBaseDataset = 
    async (
        responderId: number, 
        patients: PatientListRowDTO[], 
        dispatch: any, 
        getState: () => AppState
    ) => {
    dispatch(setPatientListSingletonReceived(responderId, patients.length));
    const newPatientListState = await addDemographicsDataset(getState, patients, responderId) as PatientListState;
    dispatch(setPatientListDisplay(newPatientListState));
};

/*
 * Toggles columns in the patient list. If disabled, the column is removed;
 * if enabled, the column is appended to the end of the current patient list.
 */
export const toggleDatasetColumn = (column: PatientListColumn) => {
    return async (dispatch: Dispatch<Action<any>>, getState: () => AppState) => {
        const state = getState();
        const newPl = Object.assign({}, state.cohort.patientList);
        const col = Object.assign({}, column);
        const cols = newPl.configuration.displayColumns.slice();
        const dsCopy = Object.assign({}, newPl.configuration.singletonDatasets.get(col.datasetId));
        const shouldDisplay = !col.isDisplayed;
        let displayPatients: PatientListRow[] = state.cohort.patientList.display.slice();

        if (!shouldDisplay) {
            cols.splice(col.index!, 1);
            for (let i = 0; i < displayPatients.length; i++) {
                displayPatients[i].values.splice(col.index!, 1);
            }
        }
        cols.forEach((c: PatientListColumn, i: number) => c.index = i);
        col.isDisplayed = shouldDisplay;

        if (shouldDisplay) {
            col.index = cols.length;
            cols.push(col);
            newPl.display = await getPatients({ ...newPl.configuration, displayColumns: cols}) as PatientListRow[];
        }
        newPl.configuration.displayColumns = cols;
        newPl.configuration.singletonDatasets.set(col.datasetId, dsCopy);
        dsCopy.columns.set(col.id, col);
        
        // Update store
        dispatch(setPatientListDisplay(newPl));
    };
};

/*
 * Toggles whether a give row in the patient list (1 row = 1 patient)
 * is open or not. If open, any available detail rows are displayed.
 */
export const togglePatientRowOpen = (patientRowId: number) => {
    return async (dispatch: Dispatch<Action<any>>, getState: () => AppState) => {
        const newPl = getState().cohort.patientList;
        newPl.display[patientRowId] = Object.assign({}, newPl.display[patientRowId], { isOpen: !newPl.display[patientRowId].isOpen });

        // Update patient list display based on newest responder results
        dispatch(setPatientListDisplay(newPl));
    };
};

/*
 * Updates the patient list based on current configuration (this is usually
 * called after column sorting changes).
 */
export const getCurrentPatientList = (sort: PatientListSort) => {
    return async (dispatch: Dispatch<Action<any>>, getState: () => AppState) => {
        const newPl = getState().cohort.patientList;
        newPl.configuration = Object.assign({}, newPl.configuration, { pageNumber: 0, sort });

        // Get patients
        newPl.display = await getPatients(newPl.configuration) as PatientListRow[];

        // Update patient list display based on newest responder results
        dispatch(setPatientListDisplay(newPl));
    };
};

/*
 * Updates the patient list based on new paginated state.
 */
export const setPatientListPagination = (id: number) => {
    return async (dispatch: Dispatch<Action<any>>, getState: () => AppState) => {
        const newPl = getState().cohort.patientList;
        newPl.configuration = Object.assign({}, newPl.configuration, { pageNumber: id });
        
        // Get patients
        newPl.display = await getPatients(newPl.configuration) as PatientListRow[];

        // Update patient list display based on newest responder results
        dispatch(setPatientListDisplay(newPl));
    };
};

/*
 * Reorders columns in the patient list after user has dragged.
 */
export const reorderColumns = (source: PatientListColumn, target: PatientListColumn) => {
    return async (dispatch: Dispatch<Action<any>>, getState: () => AppState) => {

        const stateCopy = Object.assign({}, getState().cohort.patientList);

        // Find indexes for the source and target columns within the column array
        const columnSourceIndex = stateCopy.configuration.displayColumns.findIndex((c: PatientListColumn) => c.id === source.id);
        const columnTargetIndex = stateCopy.configuration.displayColumns.findIndex((c: PatientListColumn) => c.id === target.id);

        // Don't move if they are already next to each other
        if (columnSourceIndex === columnTargetIndex) { return; }

        // Switch column positions in config
        switchArrayPositions(stateCopy.configuration.displayColumns, columnSourceIndex, columnTargetIndex);
        stateCopy.configuration.displayColumns.forEach((c: PatientListColumn, i: number) => c.index = i);

        // Switch column positions in row-level data
        const newDisplayPatients = stateCopy.display.slice(0);
        for (let i = 0; i < newDisplayPatients.length; i++) {
            const p = newDisplayPatients[i];
            switchArrayPositions(p.values, columnSourceIndex, columnTargetIndex);
        }

        // Update store
        dispatch(setPatientListDisplay(stateCopy));
    }
};

// Synchronous
export const setPatientListSingletonReceived = (id: number, rowCount: number): CohortPatientListAction => {
    return {
        id,
        rowCount,
        type: PATIENT_LIST_SINGLETON_RECEIVED
    };
};

export const setPatientListDatasetReceived = (datasetId: string, dates: DateBoundary): CohortPatientListAction => {
    return {
        datasetId,
        dates,
        id: 0,
        type: PATIENT_LIST_DATASET_RECEIVED
    };
};

export const setPatientListNetworkDatasetReceived = (id: number, datasetId: string): CohortPatientListAction => {
    return {
        datasetId,
        id,
        type: PATIENT_LIST_NETWORK_DATASET_RECEIVED
    };
};

export const setPatientListDatasetRequested = (datasetId: string): CohortPatientListAction => {
    return {
        datasetId,
        id: 0,
        type: PATIENT_LIST_DATASET_REQUESTED
    };
};

export const setPatientListDatasetNotImplemented = (datasetId: string, id: number): CohortPatientListAction => {
    return {
        datasetId,
        id,
        type: PATIENT_LIST_DATASET_NOT_IMPLEMENTED
    };
};

export const setPatientListDatasetFailure = (datasetId: string, id: number): CohortPatientListAction => {
    return {
        datasetId,
        id,
        type: PATIENT_LIST_DATASET_FAILURE
    };
};

export const setPatientListDisplay = (patientList: PatientListState): CohortPatientListAction => {
    return {
        patientList,
        id: 0,
        type: SET_PATIENT_LIST_DISPLAY
    };
};

export const disablePatientListInteractivity = (): CohortPatientListAction => {
    return {
        id: 0,
        type: PATIENT_LIST_INTERACT_DISABLED
    };
};