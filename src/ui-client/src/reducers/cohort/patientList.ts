/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CohortPatientListAction } from '../../actions/cohort/patientList';
import { CohortState, PatientListNetworkState, PatientListState, NetworkCohortState } from '../../models/state/CohortState';
import { CohortStateType } from '../../models/state/CohortState';
import { PatientListSortType } from '../../models/patientList/Configuration';

export function defaultNetworkPatientListState(): PatientListNetworkState {
    return {
        multiRowCount: 0,
        singletonRowCount: 0,
        state: CohortStateType.NOT_LOADED
    };
};

export function defaultPatientListState(): PatientListState {
    return {
        configuration: {
            displayColumns: [],
            isFetching: false,
            multirowDatasets: new Map(),
            pageNumber: 0,
            pageSize: 50,
            singletonDatasets: new Map(),
            sort: { 
                sortType: PatientListSortType.NONE
            }
        },
        display: [],
        state: CohortStateType.NOT_LOADED,
        totalPatients: 0,
        totalRows: 0
    };
};

export function setPatientListNonInteractive(state: CohortState): CohortState {
    return Object.assign({}, state, {
        patientList: {
            ...state.patientList
        }
    }) as CohortState;
};

export function toggleColumn(state: CohortState, action: CohortPatientListAction): CohortState {
    const cols = state.patientList.configuration.displayColumns.slice(0);
    const col = Object.assign({}, action.column!);

    if (col.isDisplayed) {
        cols.splice(action.column!.index, 1);
        col.isDisplayed = false;
    }
    else {
        col.isDisplayed = true;
        cols.push(col);
    }

    return Object.assign({}, state, {
        patientList: {
            ...state.patientList,
            configuration: Object.assign({}, state.patientList.configuration, {
                displayColumns: cols
            })
        }
    }) as CohortState;
};

export function setPagination(state: CohortState, action: CohortPatientListAction): CohortState {
    return Object.assign({}, state, {
        patientList: {
            ...state.patientList,
            configuration: Object.assign({}, state.patientList.configuration, {
                pageNumber: action.id
            })
        }
    })
};

export function setPatientList(state: CohortState, action: CohortPatientListAction): CohortState {
    return Object.assign({}, state, {
        patientList: {
            ...state.patientList,
            ...action.patientList,
            display: action.patientList!.display || []
        },
    }) as CohortState;
};

export function setPatientListSingletonReceived(state: CohortState, action: CohortPatientListAction): CohortState {
    const newNetworkState = Object.assign({}, state.networkCohorts.get(action.id), {
        patientList: {
            multiRowCount: 0,
            singletonRowCount: action.rowCount,
            state: CohortStateType.LOADED
        }
    });
    state.networkCohorts.set(action.id, newNetworkState);
    return Object.assign({}, state, {
        patientList: {
            ...state.patientList,
            state: CohortStateType.LOADED
        }
    });
};

export function setPatientListDatasetRequested(state: CohortState, action: CohortPatientListAction): CohortState {
    const copy = Object.assign({}, state, {
        patientList: {
            ...state.patientList,
            configuration: {
                ...state.patientList.configuration,
                isFetching: true,
                fetchingDataset: action.datasetId
            }
        }
    });
    copy.networkCohorts.forEach((nc: NetworkCohortState) => {
        nc.patientList.state = CohortStateType.REQUESTING;
    });
    return copy;
};

export function setPatientListDatasetReceived(state: CohortState, action: CohortPatientListAction): CohortState {

    // Reset patient list states (this prevents responders that failed
    // to pull additional datasets from trying again)
    state.networkCohorts.forEach((nc) => { 
        if (nc.count.state === CohortStateType.LOADED) {
            nc.patientList.state = CohortStateType.LOADED;
        }
    });

    const copy = Object.assign({}, state, {
        patientList: {
            ...state.patientList,
            configuration: {
                ...state.patientList.configuration,
                isFetching: false,
                fetchingDataset: undefined
            }
        }
    });
    const multirowDs = copy.patientList.configuration.multirowDatasets.get(action.datasetId!)!;
    
    // If at least one of the responders succeeded
    if (multirowDs) {
        const ds = copy.patientList.configuration.singletonDatasets.get(action.datasetId!);
        if (ds) {
            ds.dateBounds = action.dates!;
            ds.encounterPanelIndex = action.encounterPanelIndex;
        }
        copy.networkCohorts.forEach((nc: NetworkCohortState) => {
            multirowDs.responderStates.set(nc.id, nc.patientList.state);
            nc.patientList.state = CohortStateType.LOADED;
        });
    }
    return copy;
};

export function setNetworkPatientListDatasetReceived(state: CohortState, action: CohortPatientListAction): CohortState {
    return setPatientListDatasetState(state, action, CohortStateType.LOADED);
};

export function setNetworkPatientListDatasetFailure(state: CohortState, action: CohortPatientListAction): CohortState {
    return setPatientListDatasetState(state, action, CohortStateType.IN_ERROR);
};

export function setNetworkPatientListDatasetNotImplemented(state: CohortState, action: CohortPatientListAction): CohortState {
    return setPatientListDatasetState(state, action, CohortStateType.NOT_IMPLEMENTED);
};

function setPatientListDatasetState(state: CohortState, action: CohortPatientListAction, type: CohortStateType): CohortState {
    const network = state.networkCohorts.get(action.id!)!;
    const copy = Object.assign({}, network, {
        patientList: {
            ...network.patientList,
            state: type
        }
    });
    state.networkCohorts.set(action.id, copy);
    return Object.assign({}, state, {
        ...state,
        networkCohorts: new Map(state.networkCohorts),
        configuration: {
            ...state.patientList.configuration,
            isFetching: type === CohortStateType.REQUESTING
        }
    }); 
};
