import { showInfoModal, setNoClickModalState } from "../generalUi";
import { InformationModalState, NotificationStates } from "../../models/state/GeneralUiState";
import AdminState, { AdminPanelLoadState, AdminPanelPane } from "../../models/state/AdminState";
import { AppState } from "../../models/state/AppState";
import { getAdminSqlConfiguration } from "./configuration";
import { getSqlSets } from "../../services/admin/sqlSetApi";
import { getConceptEvents } from "../../services/admin/conceptEventApi";
import { setAdminConceptSqlSets } from "./sqlSet";
import { setAdminConceptEvents } from "./conceptEvent";
import { getAdminDemographicsDataset } from "../../services/admin/datasetApi";
import { setAdminDemographicsDataset } from "./dataset";
import { getDatasetQueryCategories } from "../../services/admin/datasetQueryCategoryApi";
import { setAdminDatasetQueryCategories } from "./datasetQueryCategory";
import { getNetworkEndpoints } from "../../services/admin/networkAndIdentityApi";
import { setAdminNetworkEndpoints } from "./networkAndIdentity";
import { getPanelFilters } from "../../services/admin/panelFilterApi";
import { getGlobalPanelFilters } from "../../services/admin/globalPanelFilterApi";
import { setAdminPanelFilters } from "./panelFilter";
import { setAdminGlobalPanelFilters } from "./globalPanelFilter";
import { getAdminVisualizationPages } from "../../services/admin/visualizationApi";
import { setAdminVisualizationPages } from "./visualization";
import { getVisualizationCategories } from "../../services/admin/visualizationCategoryApi";
import { setAdminVisualizationCategories } from "./visualizationCategory";

export const SET_ADMIN_PANEL_PANE = 'SET_ADMIN_PANEL_PANE';
export const SET_ADMIN_PANEL_LOAD_STATE = 'SET_ADMIN_PANEL_LOAD_STATE';

export interface AdminPanelAction {
    pane?: AdminPanelPane;
    state?: AdminPanelLoadState;
    type: string;
}

// Asynchronous
/*
 * Fetch Admin Panel data if it hasn't already been loaded.
 */
export const loadAdminPanelDataIfNeeded = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        if (state.auth.userContext!.isAdmin && state.admin!.state === AdminPanelLoadState.NOT_LOADED) {
            try {
                dispatch(setNoClickModalState({ message: "Loading", state: NotificationStates.Working }));

                /**
                 * Load Leaf instance configuration
                 */
                dispatch(getAdminSqlConfiguration());

                /**
                 * Load Concept-related data
                 */ 
                const sqlSets = await getSqlSets(state);
                const conceptEvents = await getConceptEvents(state);
                dispatch(setAdminConceptSqlSets(sqlSets, false));
                dispatch(setAdminConceptEvents(conceptEvents));

                /**
                 * Load panel filter-related data
                 */
                const panelFilters = await getPanelFilters(state);
                const globalPanelFilters = await getGlobalPanelFilters(state);
                dispatch(setAdminPanelFilters(panelFilters));
                dispatch(setAdminGlobalPanelFilters(globalPanelFilters));

                /**
                 * Load datasets data
                 */
                const demographics = await getAdminDemographicsDataset(state);
                const datasetQueryCategories = await getDatasetQueryCategories(state);
                dispatch(setAdminDemographicsDataset(demographics, false));
                dispatch(setAdminDatasetQueryCategories(datasetQueryCategories));

                /**
                 * Load visualization data
                 */
                 const visualizationPages = await getAdminVisualizationPages(state);
                 dispatch(setAdminVisualizationPages(visualizationPages));

                /**
                 * Load visualization category data
                 */
                 const visualizationCategories = await getVisualizationCategories(state);
                 dispatch(setAdminVisualizationCategories(visualizationCategories));

                /**
                 * Load network & identity data
                 */
                const endpoints = await getNetworkEndpoints(state);
                dispatch(setAdminNetworkEndpoints(endpoints));

                /**
                 * Finish
                 */
                dispatch(setAdminPanelLoadState(AdminPanelLoadState.LOADED));
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            } catch (err) {
                const info: InformationModalState = {
                    body: "Leaf encountered an error while attempting to load Admin data. Please check the Leaf log files for more information.",
                    header: "Error Loading Admin Data",
                    show: true
                };
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                dispatch(showInfoModal(info));
            }
        }
    };
};

/*
 * Handle switching between Admin Panel views. Prevents
 * view pane changes if admin has unsaved changes.
 */
export const checkIfAdminPanelUnsavedAndSetPane = (pane: AdminPanelPane) => {
    return async (dispatch: any, getState: () => AppState) => {
        if (adminHasActiveChange(getState().admin)) {
            const info: InformationModalState = {
                body: "Please save or undo your current changes first.",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        } else {
            dispatch(setAdminPanelPane(pane));
        }
    };
};

// Synchronous
export const setAdminPanelLoadState = (state: AdminPanelLoadState): AdminPanelAction => {
    return {
        state,
        type: SET_ADMIN_PANEL_LOAD_STATE
    };
};

export const setAdminPanelPane = (pane: number): AdminPanelAction => {
    return {
        pane,
        type: SET_ADMIN_PANEL_PANE
    };
};

// Utility
export const adminHasActiveChange = (admin: AdminState): boolean => {
    return admin.concepts.changed || 
        admin.sqlSets.changed ||
        admin.datasets.changed ||
        admin.networkAndIdentity.changed || 
        admin.panelFilters.changed ||
        admin.globalPanelFilters.changed ||
        admin.visualizations.changed || 
        admin.visualizationCategories.changed;
}