import { showInfoModal, setNoClickModalState } from "../generalUi";
import { InformationModalState, NoClickModalStates } from "../../models/state/GeneralUiState";
import { AdminPanelLoadState, AdminPanelPane } from "../../models/state/AdminState";
import { AppState } from "../../models/state/AppState";
import { getAdminSqlConfiguration } from "./configuration";
import { getSqlSets } from "../../services/admin/sqlSetApi";
import { getConceptEvents } from "../../services/admin/conceptEventApi";
import { setAdminConceptSqlSets } from "./sqlSet";
import { setAdminConceptEvents } from "./conceptEvent";
import { getAdminDemographicsDataset } from "../../services/admin/datasetApi";
import { setAdminDemographicsDataset } from "./dataset";

export const SET_ADMIN_PANEL_PANE = 'SET_ADMIN_PANEL_PANE';
export const SET_ADMIN_PANEL_SUBPANE = 'SET_ADMIN_PANEL_SUBPANE';
export const SET_ADMIN_PANEL_LOAD_STATE = 'SET_ADMIN_PANEL_LOAD_STATE';

export interface AdminPanelAction {
    pane?: AdminPanelPane;
    state?: AdminPanelLoadState;
    subPane?: number;
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
                dispatch(setNoClickModalState({ message: "Loading", state: NoClickModalStates.CallingServer }));

                /*
                 * Load Leaf instance configuration.
                 */
                dispatch(getAdminSqlConfiguration());

                /*
                 * Load Concept-related data.
                 */ 
                const sqlSets = await getSqlSets(state);
                const conceptEvents = await getConceptEvents(state);
                const demographics = await getAdminDemographicsDataset(state);
                dispatch(setAdminConceptSqlSets(sqlSets, false));
                dispatch(setAdminConceptEvents(conceptEvents));
                dispatch(setAdminDemographicsDataset(demographics, false));
                dispatch(setAdminPanelLoadState(AdminPanelLoadState.LOADED));
                dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            } catch (err) {
                const info: InformationModalState = {
                    body: "Leaf encountered an error while attempting to load Admin data. Please check the Leaf log files for more information.",
                    header: "Error Loading Admin Data",
                    show: true
                };
                dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                dispatch(showInfoModal(info));
            }
        }
    };
};

/*
 * Handles switching between Admin Panel views. Prevents
 * view pane changes if admin has unsaved Concept changes.
 */
export const checkIfAdminPanelUnsavedAndSetSubPane = (subPane: number) => {
    return async (dispatch: any, getState: () => AppState) => {
        const admin = getState().admin!;
        if (admin.concepts.changed || admin.sqlSets.changed) {
            const info: InformationModalState = {
                body: "Please save or undo your current changes first.",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        } else {
            dispatch(setAdminPanelSubPane(subPane));
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

export const setAdminPanelSubPane = (subPane: number): AdminPanelAction => {
    return {
        subPane,
        type: SET_ADMIN_PANEL_SUBPANE
    };
};