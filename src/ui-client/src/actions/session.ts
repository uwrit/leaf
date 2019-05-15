/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { registerNetworkCohorts } from '../actions/cohort/count';
import { initializeSearchEngine } from '../actions/conceptSearch';
import { AppState } from '../models/state/AppState';
import { NetworkIdentity, NetworkIdentityRespondersDTO, NetworkIdentityResponseDTO, RuntimeMode } from '../models/NetworkResponder';
import { SessionContext } from '../models/Session';
import { Attestation } from '../models/Session';
import { fetchHomeIdentityAndResponders, fetchResponderIdentity } from '../services/networkRespondersApi';
import { getExportOptions } from '../services/redcapApi';
import { getSessionTokenAndContext, refreshSessionTokenAndContext, saveSessionAndForceReLogin, getPrevSession, logoutToken } from '../services/sessionApi';
import { requestRootConcepts, setExtensionConcepts } from './concepts';
import { setExportOptions } from './dataExport';
import { fetchAvailableDatasets } from '../services/cohortApi';
import { errorResponder, setResponders } from './networkResponders';
import { setPatientListDatasets, showConfirmationModal, setPatientListTotalDatasetsAvailableCount } from '../actions/generalUi';
import { getSavedQueries, getQueriesAsConcepts } from '../services/queryApi';
import { ConceptExtensionInitializer } from '../models/concept/Concept';
import { addSavedQueries, setCurrentQuery } from './queries';
import { ConfirmationModalState } from '../models/state/GeneralUiState';
import { setPanels } from './panels';
import { setPanelFilters, setPanelFilterActiveStates } from './panelFilter';
import { addDatasets } from '../services/datasetSearchApi';
import { AuthMechanismType } from '../models/Auth';

export const SUBMIT_ATTESTATION = 'SUBMIT_ATTESTATION';
export const ERROR_ATTESTATION = 'ERROR_ATTESTATION';
export const COMPLETE_ATTESTATION = 'COMPLETE_ATTESTATION';
export const SET_SESSION_LOAD_STATE = 'SET_SESSION_LOAD_STATE';
export const SET_ACCESS_TOKEN = 'SET_ACCESS_TOKEN';

export interface SessionAction {
    attestation?: Attestation;
    sessionLoadDisplay?: string;
    sessionLoadProgressPercent?: number;
    nonce?: string;
    error?: boolean;
    context?: SessionContext;
    type: string;
}

// Asynchronous
/*
 * Attemp to attest and load data necessary for the session.
 */
export const attestAndLoadSession = (attestation: Attestation) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        try {
            /* 
             * Get session token.
             */
            dispatch(setSessionLoadState('Submitting Attestation', 5));
            dispatch(submitAttestation(attestation));
            const ctx = await getSessionTokenAndContext(getState(), attestation) as SessionContext;
            dispatch(setSessionContext(ctx));

            /* 
             * Get home node identity.
             */
            dispatch(setSessionLoadState('Finding Home Leaf server', 20));
            const homeBase = await fetchHomeIdentityAndResponders(getState()) as NetworkIdentityRespondersDTO;
            homeBase.identity.address = '';

            /* 
             * Get responders.
             */
            dispatch(setSessionLoadState('Finding Partner Leaf servers', 40));

            /* 
             * Fetch network responders if not in identified mode.
             */
            const responders: NetworkIdentity[] = [];
            if (homeBase.identity.runtime === RuntimeMode.Full) {
                responders.push({ ...homeBase.identity, enabled: true, id: 0, isHomeNode: true });
            }
            
            if (!attestation.isIdentified && homeBase.responders.length && getState().auth.userContext!.isFederatedOkay) {
                await Promise.all(
                    homeBase.responders.map((nr: NetworkIdentityResponseDTO, id: number) => { 
                        return new Promise( async(resolve, reject) => {
                            fetchResponderIdentity(getState(), nr)
                                .then(
                                    response => responders.push({ ...response.data, address: nr.address, enabled: true, id: (id + 1), isHomeNode: false }),
                                    error => errorResponder(nr.id, error))
                                .then(() => resolve())
                        })
                    })
                ) 
            }         

            /* 
             * Set responders.
             */
            dispatch(setResponders(responders));
            dispatch(registerNetworkCohorts(responders));

            /* 
             * Load export options.
             */
            dispatch(setSessionLoadState('Loading Export options', 50));
            const exportOptResponse = await getExportOptions(getState());
            dispatch(setExportOptions(exportOptResponse.data));

            /* 
             * Load concepts.
             */
            dispatch(setSessionLoadState('Loading Concepts', 60));
            await dispatch(requestRootConcepts());

            /* 
             * Load datasets.
             */
            dispatch(setSessionLoadState('Loading Patient List Datasets', 70));
            const datasetsResp = await fetchAvailableDatasets(getState());
            const datasetsCategorized = await addDatasets(datasetsResp.data);
            dispatch(setPatientListDatasets(datasetsCategorized));
            dispatch(setPatientListTotalDatasetsAvailableCount(datasetsResp.data.length));
            
            /*
             * Load saved queries.
             */
            dispatch(setSessionLoadState('Loading Saved Queries', 80));
            const savedCohortsResp = await getSavedQueries(getState());
            const savedCohortConcepts = await getQueriesAsConcepts(savedCohortsResp.data) as ConceptExtensionInitializer;
            dispatch(addSavedQueries(savedCohortsResp.data));
            dispatch(setExtensionConcepts(savedCohortConcepts.concepts, savedCohortConcepts.roots));

            /* 
             * Initiliaze web worker search.
             */
            dispatch(setSessionLoadState('Initializing Search Engine', 90));
            await dispatch(initializeSearchEngine());

            /* 
             * All done.
             */
            dispatch(completeAttestation(ctx.rawDecoded["access-nonce"]));

            /* 
             * Check if continue previous session.
             */
            handleSessionReload(dispatch, getState());
        } catch (err) {
            console.log(err);
            const message = 'Uh oh. Something went wrong while loading Leaf information from the server. Please contact your Leaf administrator.';
            dispatch(setSessionLoadState(message, 0));
            dispatch(errorAttestation(true));
        }
    };
};

/*
 * Called at a regular interval to refresh the session.
 */
export const refreshSession = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        const ctx = await refreshSessionTokenAndContext(state) as SessionContext;
        dispatch(setSessionContext(ctx));
    };
};

/*
 * Wrapper method for saving session and logging out. Called on inactivity timeout.
 */
export const saveSessionAndLogout = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        saveSessionAndForceReLogin(getState());
    };
};

/*
 * Logs the user out and redirects to the designated logoutURI. If using in a 
 * secured mode, notifies the server to blacklist the current session token as well.
 */
export const logout = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        const config = state.auth.config!;
        let logoutUri = config.logoutUri;

        if (config.mechanism !== AuthMechanismType.Unsecured) {
            const loggedOut = await logoutToken(getState());
            if (loggedOut) {
                logoutUri = loggedOut.logoutURI;
            }
        }

        if (logoutUri) {
            window.location = (logoutUri as any);
        }
        else {
            window.location = window.location;
        }
    };
}

// Synchronous
export const errorAttestation = (error: boolean): SessionAction => {
    return {
        error,
        type: ERROR_ATTESTATION
    };
};

export const submitAttestation = (attestation: Attestation): SessionAction => {
    return {
        attestation,
        type: SUBMIT_ATTESTATION
    };
};

export const setSessionContext = (context: SessionContext): SessionAction => {
    return {
        context,
        type: SET_ACCESS_TOKEN
    };
};

export const completeAttestation = (nonce: string) => {
    return {
        nonce,
        type: COMPLETE_ATTESTATION
    };
};

export const setSessionLoadState = (sessionLoadDisplay: string, sessionLoadProgressPercent: number): SessionAction => {
    return {
        sessionLoadDisplay,
        sessionLoadProgressPercent,
        type: SET_SESSION_LOAD_STATE
    };
};

/*
 * Handles checking for and allowing user to reload a session saved
 * in the last 5 minutes, typically after an inactivity timeout.
 */
const handleSessionReload = (dispatch: Dispatch<any>, state: AppState) => {
    const prev = getPrevSession(state);
    if (prev) {
        const diffMinutes = Math.floor(((new Date().getTime() / 1000) - prev.timestamp) / 60);
        const diffDisplay = 
            diffMinutes === 0 ? 'less than a minute ago' :
            diffMinutes === 1 ? 'about 1 minute ago' :
            `about ${diffMinutes} minutes ago`;
        const onClickYes = () => {
            dispatch(setCurrentQuery(prev.queries.current));
            dispatch(setPanels(prev.panels));
            dispatch(setPanelFilterActiveStates(prev.panelFilters));
        };

        if (diffMinutes < 60 * 8) {
            const confirm: ConfirmationModalState = {
                body: `Do you want to resume your previous session (saved ${diffDisplay})?`,
                header: 'Continue previous session',
                onClickNo: () => null,
                onClickYes,
                show: true,
                noButtonText: `No, I'll start fresh`,
                yesButtonText: `Yes, load my previous query`
            };
            dispatch(showConfirmationModal(confirm));
        }
    }
};