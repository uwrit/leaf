/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { 
    Routes, 
    InformationModalState, 
    ConfirmationModalState, 
    NoClickModalState, 
    SideNotificationState, 
    MyLeafTabType, 
    NotificationStates, 
    UserInquiry, 
    UserInquiryType
} from '../models/state/GeneralUiState';
import { Browser } from '../models/state/GeneralUiState';
import { RouteConfig } from '../config/routes';
import { Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { loadAdminPanelDataIfNeeded } from './admin/admin';
import { getDemographicsIfNeeded } from './cohort/count';
import { CohortStateType } from '../models/state/CohortState';
import { getAllMetdata } from '../services/dataImport';
import { getExtensionRootConcepts } from '../services/queryApi';
import { sendUserInquiry } from '../services/notificationApi';
import { setExtensionRootConcepts } from './concepts';
import { setImportsMetadata } from './dataImport';

export const SET_MYLEAF_TAB = 'SET_MYLEAF_TAB';
export const SET_COHORT_COUNT_BOX_STATE = 'SET_COHORT_COUNT_BOX_STATE';
export const SET_ROUTE = 'SET_ROUTE';
export const SET_ROUTE_CONFIG = 'SET_ROUTE_CONFIG';
export const SET_BROWSER = 'SET_BROWSER';
export const TOGGLE_SAVE_QUERY_PANE = 'TOGGLE_SAVE_QUERY_PANE';
export const TOGGLE_MY_LEAF_MODAL = 'TOGGLE_MY_LEAF_MODAL';
export const MY_LEAF_MODAL_HIDE = 'MY_LEAF_MODAL_HIDE';
export const MY_LEAF_MODAL_SHOW = 'MY_LEAF_MODAL_SHOW';
export const TOGGLE_EXPORT_DATA_MODAL = 'TOGGLE_EXPORT_DATA_MODAL';
export const INFO_MODAL_SHOW = 'INFO_MODAL_SHOW';
export const INFO_MODAL_HIDE = 'INFO_MODAL_HIDE';
export const CONFIRM_MODAL_SHOW = 'CONFIRM_MODAL_SHOW';
export const CONFIRM_MODAL_HIDE = 'CONFIRM_MODAL_HIDE';
export const NOCLICK_MODAL_SET_STATE = 'NOCLICK_MODAL_SET_STATE';
export const SIDE_NOTIFICATION_SET_STATE = 'SIDE_NOTIFICATION_SET_STATE';
export const SET_USER_QUESTION_STATE = 'SET_USER_QUESTION_STATE'

export interface GeneralUiAction {
    browser?: Browser;
    cohortCountBoxVisible?: boolean;
    cohortCountBoxMinimized?: boolean;
    cohortInfoButtonVisible?: boolean;
    confirmModal?: ConfirmationModalState;
    infoModal?: InformationModalState;
    noclickModal?: NoClickModalState;
    searchTerm?: string;
    route?: Routes;
    routeConfig?: RouteConfig[];
    selectable?: boolean;
    sideNotification?: SideNotificationState;
    tab?: MyLeafTabType;
    type: string;
    userInquiry?: UserInquiry;
}

// Asynchronous
export const handleSidebarTabClick = (route: Routes) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        const admin = state.admin;
        const currentRoute = state.generalUi.currentRoute;
        const cohortCountState = state.cohort.count.state;

        if (route === currentRoute) {
            return;
        } 
        else if (currentRoute === Routes.AdminPanel && admin && (
            admin.concepts.changed ||
            admin.sqlSets.changed  || 
            admin.datasets.changed || 
            admin.networkAndIdentity.changed)
            ) {
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
    };
};

/*
 * Toggle the MyLeaf Modal show/hide state. If data imports are
 * enabled but not yet loaded, load.
 */
export const toggleMyLeafModal = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        dispatch(toggleMyLeafModalVisibility());
        if (state.dataImport.enabled && !state.dataImport.loaded) {

            dispatch(setNoClickModalState({ message: "Loading Data", state: NotificationStates.Working }));
            const imports = await getAllMetdata(state);
            const extensionConcepts = await getExtensionRootConcepts(state.dataImport, imports, [ ...state.queries.saved.values() ]);
            dispatch(setExtensionRootConcepts(extensionConcepts));
            dispatch(setImportsMetadata(imports));
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
        }
    };
};

/*
 * Send the current user inquiry to the API, which generates an email to admins.
 */
export const sendInquiry = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();

        try {
            dispatch(setNoClickModalState({ message: "Sending", state: NotificationStates.Working }));
            await sendUserInquiry(state, state.generalUi.userQuestion);
            dispatch(setNoClickModalState({ message: "Question Sent", state: NotificationStates.Complete }));
            dispatch(setUserInquiryState({ text: '', show: false, associatedQuery: undefined, type: UserInquiryType.HelpMakingQuery }));
        } catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "Uh oh, something went wrong when attempting notify the administrator. We are sorry for the inconvenience.",
                header: "Error Sending Question",
                show: true
            };
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            dispatch(showInfoModal(info));
        } 
    };
};

// Synchronous
export const setNoClickModalState = (noclickModal: NoClickModalState): GeneralUiAction => {
    return {
        noclickModal,
        type: NOCLICK_MODAL_SET_STATE
    }
};

export const setSideNotificationState = (sideNotification: SideNotificationState): GeneralUiAction => {
    return {
        sideNotification,
        type: SIDE_NOTIFICATION_SET_STATE
    };
};

export const setCohortCountBoxState = (cohortCountBoxVisible: boolean, cohortCountBoxMinimized: boolean, cohortInfoButtonVisible: boolean): GeneralUiAction => {
    return {
        cohortCountBoxMinimized,
        cohortCountBoxVisible,
        cohortInfoButtonVisible,
        type: SET_COHORT_COUNT_BOX_STATE
    };
};

export const setUserInquiryState = (userInquiry: UserInquiry): GeneralUiAction => {
    return {
        userInquiry,
        type: SET_USER_QUESTION_STATE
    }
};

export const showInfoModal = (infoModal: InformationModalState): GeneralUiAction => {
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

export const showConfirmationModal = (confirmModal: ConfirmationModalState): GeneralUiAction => {
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

const toggleMyLeafModalVisibility = (): GeneralUiAction => {
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

export const setBrowser = (browser: Browser): GeneralUiAction  => {
    return {
        browser,
        type: SET_BROWSER
    }
};

export const setMyLeafTab = (tab: MyLeafTabType): GeneralUiAction  => {
    return {
        tab,
        type: SET_MYLEAF_TAB
    }
};