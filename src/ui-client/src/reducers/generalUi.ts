/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { COHORT_COUNT_START } from '../actions/cohort/count';
import { 
    GeneralUiAction, 
    SET_COHORT_COUNT_BOX_STATE, 
    SET_ROUTE, 
    SET_ROUTE_CONFIG,
    SET_BROWSER,
    TOGGLE_EXPORT_DATA_MODAL, 
    TOGGLE_MY_LEAF_MODAL, 
    TOGGLE_SAVE_QUERY_PANE, 
    SET_PATIENTLIST_DATASETS, 
    MY_LEAF_MODAL_HIDE,
    MY_LEAF_MODAL_SHOW,
    SET_PATIENTLIST_DATASET_BY_INDEX,
    REMOVE_PATIENTLIST_DATASET
} from '../actions/generalUi';
import { SET_PANEL_FILTERS, TOGGLE_PANEL_FILTER } from '../actions/panelFilter';
import { 
    ADD_PANEL_ITEM, 
    REMOVE_PANEL_ITEM,
    RESET_PANELS,
    SET_PANEL_DATE_FILTER,
    SET_PANEL_INCLUSION,
    SET_PANEL_ITEM_NUMERIC_FILTER,
    SET_SUBPANEL_INCLUSION,
    SET_SUBPANEL_JOIN_SEQUENCE,
    SET_SUBPANEL_MINCOUNT,
    SELECT_CONCEPT_SPECIALIZATION,
    DESELECT_CONCEPT_SPECIALIZATION
 } from '../actions/panels';
import { GeneralUiState, Routes, NoClickModalStates } from '../models/state/GeneralUiState';
import {
    INFO_MODAL_SHOW,
    INFO_MODAL_HIDE,
    CONFIRM_MODAL_SHOW,
    CONFIRM_MODAL_HIDE,
    NOCLICK_MODAL_SET_STATE,
    SET_DATASET_SEARCH_TERM,
    SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT
} from '../actions/generalUi';
import { CategorizedDatasetRef } from '../models/patientList/Dataset';
import { OPEN_SAVED_QUERY } from '../actions/queries';

export const defaultGeneralUiState = (): GeneralUiState => {
    return {
        cohortCountBox: {
            boxMinimized: false,
            boxVisible: false,
            infoButtonVisible: false,
        },
        confirmationModal: {
            body: "",
            header: "",
            onClickNo: () => {},
            onClickYes: () => {},
            noButtonText: "",
            show: false,
            yesButtonText: "",
        },
        datasets: {
            available: [],
            unfilteredAvailableCount: 0,
            searchTerm: ''
        },
        informationModal: {
            body: "",
            header: "",
            show: false
        },
        currentRoute: Routes.FindPatients,
        noclickModal: {
            message: "",
            state: NoClickModalStates.Hidden
        },
        routes: [],
        showExportDataModal: false,
        showMyLeafModal: false,
        showSaveQueryPane: false
    };
};

const setCohortCountBoxState = (state: GeneralUiState, boxVisible: boolean, boxMinimized: boolean, infoButtonVisible: boolean): GeneralUiState => {
    return Object.assign({}, state, {
        cohortCountBox: {
            boxMinimized,
            boxVisible,
            infoButtonVisible
        }
    });
};

const setPatientListDatasets = (state: GeneralUiState, datasets: CategorizedDatasetRef[]): GeneralUiState => {
    return Object.assign({}, state, {
        datasets: {
            ...state.datasets,
            available: datasets,
        }
    });
};

const setPatientListDatasetByIndex = (state: GeneralUiState, action: GeneralUiAction): GeneralUiState => {
    const available = state.datasets.available.slice();
    const newDs = Object.assign({}, available[action.datasetCategoryIndex!].datasets[action.datasetIndex!], action.dataset);
    available[action.datasetCategoryIndex!].datasets[action.datasetIndex!] = newDs;

    return Object.assign({}, state, {
        datasets: {
            ...state.datasets,
            available,
        }
    });
};

const removePatientListDatasetByIndex = (state: GeneralUiState, action: GeneralUiAction): GeneralUiState => {
    const available = state.datasets.available.slice();
    available[action.datasetCategoryIndex!].datasets.splice(action.datasetIndex!,1);

    return Object.assign({}, state, {
        datasets: {
            ...state.datasets,
            available,
        }
    });
};

const setPatientListDatasetSearchTerm = (state: GeneralUiState, searchTerm: string): GeneralUiState => {
    return Object.assign({}, state, {
        datasets: {
            ...state.datasets,
            searchTerm
        }
    });
};

const setPatientListDatasetTotalAvailable = (state: GeneralUiState, datasetsAvailableCount: number): GeneralUiState => {
    return Object.assign({}, state, {
        datasets: {
            ...state.datasets,
            unfilteredAvailableCount: datasetsAvailableCount
        }
    });
};

export const generalUi = (state: GeneralUiState = defaultGeneralUiState(), action: GeneralUiAction): GeneralUiState => {

    switch (action.type) {
        case SET_COHORT_COUNT_BOX_STATE:
            return setCohortCountBoxState(state, action.cohortCountBoxVisible!, action.cohortCountBoxMinimized!, action.cohortInfoButtonVisible!);
        case COHORT_COUNT_START:
            return setCohortCountBoxState(state, true, false, false);
        case OPEN_SAVED_QUERY:
            return Object.assign({}, state, { currentRoute: Routes.FindPatients }); 
        case SET_ROUTE:
            return Object.assign({}, state, { currentRoute: action.route }); 
        case SET_ROUTE_CONFIG:
            return Object.assign({}, state, { routes: action.routeConfig }); 
        case TOGGLE_SAVE_QUERY_PANE: 
            return Object.assign({}, state, { showSaveQueryPane: !state.showSaveQueryPane });
        case TOGGLE_MY_LEAF_MODAL: 
            return Object.assign({}, state, { showMyLeafModal: !state.showMyLeafModal });
        case MY_LEAF_MODAL_HIDE: 
            return Object.assign({}, state, { showMyLeafModal: false });
        case MY_LEAF_MODAL_SHOW: 
            return Object.assign({}, state, { showMyLeafModal: true });
        case TOGGLE_EXPORT_DATA_MODAL: 
            return Object.assign({}, state, { showExportDataModal: !state.showExportDataModal });
        case INFO_MODAL_SHOW:
            return Object.assign({}, state, { informationModal: action.infoModal! });
        case INFO_MODAL_HIDE:
            return Object.assign({}, state, { informationModal: { ...state.informationModal, show: false, onClickOkay: null } });
        case CONFIRM_MODAL_SHOW:
            return Object.assign({}, state, { confirmationModal: action.confirmModal! });
        case CONFIRM_MODAL_HIDE:
            return Object.assign({}, state, { confirmationModal: { ...state.confirmationModal, show: false } });
        case NOCLICK_MODAL_SET_STATE:
            return Object.assign({}, state, { noclickModal: action.noclickModal! });
        case SET_BROWSER:
            return Object.assign({}, state, { browser: action.browser! });

        // Patient List datasets
        case SET_PATIENTLIST_DATASETS:
            return setPatientListDatasets(state, action.datasets!);
        case SET_PATIENTLIST_DATASET_BY_INDEX:
            return setPatientListDatasetByIndex(state, action);
        case SET_DATASET_SEARCH_TERM:
            return setPatientListDatasetSearchTerm(state, action.searchTerm!);
        case SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT:
            return setPatientListDatasetTotalAvailable(state, action.datasetsAvailableCount!);
        case REMOVE_PATIENTLIST_DATASET:
            return removePatientListDatasetByIndex(state, action);
        
        case ADD_PANEL_ITEM:
        case REMOVE_PANEL_ITEM:
        case SET_PANEL_ITEM_NUMERIC_FILTER:
        case SET_PANEL_INCLUSION:
        case SET_PANEL_DATE_FILTER:
        case SET_SUBPANEL_INCLUSION:
        case SET_SUBPANEL_MINCOUNT:
        case SET_PATIENTLIST_TOTAL_DATASETS_AVAILABLE_COUNT:
        case SET_SUBPANEL_JOIN_SEQUENCE:
        case SELECT_CONCEPT_SPECIALIZATION:
        case DESELECT_CONCEPT_SPECIALIZATION:
        case SET_PANEL_FILTERS:
        case TOGGLE_PANEL_FILTER:
        case RESET_PANELS:
            return setCohortCountBoxState(state, false, false, false);
        default:
            return state;
    }
};