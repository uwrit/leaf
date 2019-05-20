/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Routes, InformationModalState, ConfirmationModalState, NoClickModalState } from '../models/state/GeneralUiState';
import { Browser } from '../models/state/GeneralUiState';
import { RouteConfig } from '../config/routes';
import { Dispatch } from 'redux';
import { CategorizedDatasetRef } from '../models/patientList/Dataset';
import { AppState } from '../models/state/AppState';
import { searchDatasets, allowAllDatasets } from '../services/datasetSearchApi';
import { loadAdminPanelDataIfNeeded } from './admin/admin';
import { getDemographicsIfNeeded } from './cohort/count';
import { CohortStateType } from '../models/state/CohortState';

export const SET_COHORT_COUNT_BOX_STATE = 'SET_COHORT_COUNT_BOX_STATE';
export const SET_ROUTE = 'SET_ROUTE';
export const SET_ROUTE_CONFIG = 'SET_ROUTE_CONFIG';
export const SET_PATIENTLIST_DATASETS = 'SET_PATIENTLIST_DATASETS';
export const SET_BROWSER = 'SET_BROWSER';
export const SET_DATASET_SEARCH_TERM = 'SET_DATASET_SEARCH_TERM';
export const SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT = 'SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT';
export const TOGGLE_SAVE_QUERY_PANE = 'TOGGLE_SAVE_QUERY_PANE';
export const TOGGLE_MY_LEAF_MODAL = 'TOGGLE_MY_LEAF_MODAL';
export const MY_LEAF_MODAL_HIDE = 'MY_LEAF_MODAL_HIDE';
export const MY_LEAF_MODAL_SHOW = 'MY_LEAF_MODAL_SHOW';
export const TOGGLE_EXPORT_DATA_MODAL = 'TOGGLE_EXPORT_DATA_MODAL';
export const INFO_MODAL_SHOW = "INFO_MODAL_SHOW";
export const INFO_MODAL_HIDE = "INFO_MODAL_HIDE";
export const CONFIRM_MODAL_SHOW = "CONFIRM_MODAL_SHOW";
export const CONFIRM_MODAL_HIDE = "CONFIRM_MODAL_HIDE";
export const NOCLICK_MODAL_SET_STATE = "NOCLICK_MODAL_SET_STATE";

export interface GeneralUiAction {
    browser?: Browser;
    cohortCountBoxVisible?: boolean;
    cohortCountBoxMinimized?: boolean;
    cohortInfoButtonVisible?: boolean;
    confirmModal?: ConfirmationModalState;
    datasetsAvailableCount?: number;
    datasets?: CategorizedDatasetRef[];
    infoModal?: InformationModalState;
    noclickModal?: NoClickModalState;
    searchTerm?: string;
    route?: Routes;
    routeConfig?: RouteConfig[];
    selectable?: boolean;
    type: string;
}

// Asynchronous
export const searchPatientListDatasets = (searchTerm: string) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const results = await searchDatasets(searchTerm);
        dispatch(setPatientListDatasets(results));
    };
};

export const getAllPatientListDatasets = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const results = await allowAllDatasets();
        dispatch(setPatientListDatasets(results));
        dispatch(setDatasetSearchTerm(''));
    };
};

export const handleSidebarTabClick = (route: Routes) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        const currentRoute = state.generalUi.currentRoute;
        const cohortCountState = state.cohort.count.state;

        if (route === currentRoute) {
            return;
        } 
        else if (currentRoute === Routes.AdminPanel && (state.admin!.concepts.changed || state.admin!.sqlSets.changed)) {
            const info: InformationModalState = {
                body: "Please save or undo your current changes first.",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        } else if (route === Routes.FindPatients) {
            dispatch(setRoute(route));
        } else if (route === Routes.AdminPanel) {
            dispatch(setRoute(route));
            dispatch(loadAdminPanelDataIfNeeded());
        } else if (cohortCountState === CohortStateType.LOADED)  {
            if (route === Routes.PatientList || route === Routes.Visualize) {
                dispatch(getDemographicsIfNeeded());
            }
            dispatch(setRoute(route));
        }
    }
}

// Synchronous
export const setNoClickModalState = (noclickModal: NoClickModalState): GeneralUiAction => {
    return {
        noclickModal,
        type: NOCLICK_MODAL_SET_STATE
    }
};

export const setCohortCountBoxState = (cohortCountBoxVisible: boolean, cohortCountBoxMinimized: boolean, cohortInfoButtonVisible: boolean): GeneralUiAction => {
    return {
        cohortCountBoxMinimized,
        cohortCountBoxVisible,
        cohortInfoButtonVisible,
        type: SET_COHORT_COUNT_BOX_STATE
    };
};

export const showInfoModal = (infoModal: InformationModalState) => {
    return {
        infoModal,
        type: INFO_MODAL_SHOW
    }
};

export const hideInfoModal = () => {
    return {
        type: INFO_MODAL_HIDE
    }
};

export const showConfirmationModal = (confirmModal: ConfirmationModalState) => {
    return {
        confirmModal,
        type: CONFIRM_MODAL_SHOW
    }
};

export const hideConfirmModal = () => {
    return {
        type: CONFIRM_MODAL_HIDE
    }
};

export const setRoute = (route: Routes): GeneralUiAction => {
    return {
        route,
        type: SET_ROUTE
    };
};

export const setRouteConfig = (routeConfig: RouteConfig[]): GeneralUiAction => {
    return {
        routeConfig,
        type: SET_ROUTE_CONFIG
    };
}

export const toggleSaveQueryPane = (): GeneralUiAction => {
    return {
        type: TOGGLE_SAVE_QUERY_PANE
    };
};

export const toggleMyLeafModal = (): GeneralUiAction => {
    return {
        type: TOGGLE_MY_LEAF_MODAL
    };
};

export const hideMyLeafModal = (): GeneralUiAction => {
    return {
        type: MY_LEAF_MODAL_HIDE
    };
};

export const showMyLeafModal = (): GeneralUiAction => {
    return {
        type: MY_LEAF_MODAL_SHOW
    };
};

export const toggleExportDataModal = (): GeneralUiAction => {
    return {
        type: TOGGLE_EXPORT_DATA_MODAL
    };
};

export const setPatientListDatasets = (datasets: CategorizedDatasetRef[]): GeneralUiAction  => {
    return {
        datasets,
        type: SET_PATIENTLIST_DATASETS
    };
};

export const setPatientListTotalDatasetsAvailableCount = (datasetsAvailableCount: number): GeneralUiAction  => {
    return {
        datasetsAvailableCount,
        type: SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT
    };
};

export const setBrowser = (browser: Browser): GeneralUiAction  => {
    return {
        browser,
        type: SET_BROWSER
    }
};

export const setDatasetSearchTerm = (searchTerm: string): GeneralUiAction  => {
    return {
        searchTerm,
        type: SET_DATASET_SEARCH_TERM
    };
};
