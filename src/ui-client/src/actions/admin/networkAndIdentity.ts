/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { NetworkIdentity } from "../../models/NetworkResponder";
import { NetworkEndpoint, Certificate } from "../../models/admin/Network";
import { AppState } from "../../models/state/AppState";
import { createEndpoint, updateEndpoint, deleteEndpoint, getCertificate } from "../../services/admin/networkAndIdentityApi";
import { setNoClickModalState, showInfoModal, setSideNotificationState } from "../generalUi";
import { NotificationStates, InformationModalState } from "../../models/state/GeneralUiState";
import { getApiUpdateQueue } from "../../utils/admin/networkAndidentity";
import { setResponder } from "../networkResponders";

export const SET_ADMIN_NETWORK_IDENTITY = 'SET_ADMIN_NETWORK_IDENTITY';
export const SET_ADMIN_NETWORK_ENDPOINT = 'SET_ADMIN_NETWORK_ENDPOINT';
export const SET_ADMIN_NETWORK_ENDPOINTS = 'SET_ADMIN_NETWORK_ENDPOINTS';
export const SET_ADMIN_NETWORK_CERT_MODAL = 'SET_ADMIN_NETWORK_CERT_MODAL';
export const TOGGLE_ADMIN_NETWORK_CERT_MODAL_SHOWN = 'TOGGLE_ADMIN_NETWORK_CERT_MODAL_SHOWN';
export const REMOVE_ADMIN_NETWORK_ENDPOINT = 'REMOVE_ADMIN_NETWORK_ENDPOINT';
export const REVERT_ADMIN_NETWORK_CHANGES = 'REVERT_ADMIN_NETWORK_CHANGES';

export interface AdminNetworkAndIdentityAction {
    changed?: boolean;
    cert?: Certificate;
    endpoint?: NetworkEndpoint;
    endpoints?: NetworkEndpoint[];
    identity?: NetworkIdentity;
    show?: boolean;
    type: string;
}

// Asynchronous
/*
 * Process all queued Network Identity & Endpoint API operations sequentially.
 */
export const processApiUpdateQueue = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        dispatch(setNoClickModalState({ message: "Saving", state: NotificationStates.Working }));

        try {
            const queue = getApiUpdateQueue(state.admin!.networkAndIdentity, dispatch, state);
            for (const process of queue) {
                await process();
            }

            // All done!
            dispatch(setResponder(state.admin!.networkAndIdentity.identity));
            dispatch(setAdminNetworkIdentity(state.admin!.networkAndIdentity.identity, false));
            dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Changes Saved' }));
        } catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "An error occurred while attempting update the Leaf database with your changes. Please see the Leaf error logs for details.",
                header: "Error Applying Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        } finally {
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
        }
    }
};

/*
 * Save or update a Network Endpoint, depending on
 * if it is preexisting or new.
 */
export const saveOrUpdateNetworkEndpoint = async (endpoint: NetworkEndpoint, dispatch: any, state: AppState): Promise<NetworkEndpoint> => {
    let newEndpoint = null;
    if (endpoint.unsaved) {
        newEndpoint = await createEndpoint(state, endpoint);
        dispatch(removeAdminNetworkEndpoint(endpoint));
    } else {
        newEndpoint = await updateEndpoint(state, endpoint);
    }
    dispatch(setAdminNetworkEndpoint(newEndpoint, false));
    return newEndpoint;
};

/*
 * Delete a existing Concept Specialization.
 */
export const deleteNetworkEndpoint = (endpoint: NetworkEndpoint) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            dispatch(setNoClickModalState({ message: "Deleting", state: NotificationStates.Working }));
            deleteEndpoint(state, endpoint)
                .then(
                    response => {
                        dispatch(removeAdminNetworkEndpoint(endpoint));
                        dispatch(setSideNotificationState({ state: NotificationStates.Complete, message: 'Endpoint Deleted' }));
                },  error => {
                        dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Network Endpoint. Please see the Leaf error logs for details.",
                            header: "Error Deleting Network Endpoint",
                            show: true
                        };
                        dispatch(showInfoModal(info));
                }).then(() => dispatch(setNoClickModalState({ state: NotificationStates.Hidden })));
        } catch (err) {
            console.log(err);
        } 
    }
};

/*
 * Test and attempt to load remote Leaf instance cert
 * info based on current URL.
 */
export const attemptLoadRemoteLeafCert = (endpoint: NetworkEndpoint) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            dispatch(setNoClickModalState({ message: "Phoning a friend...", state: NotificationStates.Working }));
            const cert = await getCertificate(getState(), endpoint.address);
            dispatch(setAdminNetworkCertModalContent(cert, endpoint));
        } catch (err) {
            const info: InformationModalState = {
                body: `No remote Leaf instance was found at ${endpoint.address}. Check that the address is correct and try again.`,
                header: "No Leaf Instance found",
                show: true
            };
            dispatch(showInfoModal(info));
        }
        dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
    }
};

// Synchronous
export const setAdminNetworkIdentity = (identity: NetworkIdentity, changed: boolean): AdminNetworkAndIdentityAction => {
    return {
        changed,
        identity,
        type: SET_ADMIN_NETWORK_IDENTITY
    };
};

export const setAdminNetworkEndpoint = (endpoint: NetworkEndpoint, changed: boolean): AdminNetworkAndIdentityAction => {
    return {
        changed,
        endpoint,
        type: SET_ADMIN_NETWORK_ENDPOINT
    };
};

export const setAdminNetworkEndpoints = (endpoints: NetworkEndpoint[]): AdminNetworkAndIdentityAction => {
    return {
        endpoints,
        type: SET_ADMIN_NETWORK_ENDPOINTS
    };
};

export const removeAdminNetworkEndpoint = (endpoint: NetworkEndpoint): AdminNetworkAndIdentityAction => {
    return {
        endpoint,
        type: REMOVE_ADMIN_NETWORK_ENDPOINT
    };
};

export const revertAdminNetworkChanges = (): AdminNetworkAndIdentityAction => {
    return {
        type: REVERT_ADMIN_NETWORK_CHANGES
    };
};

export const setAdminNetworkCertModalContent = (cert: Certificate, endpoint: NetworkEndpoint): AdminNetworkAndIdentityAction => {
    return {
        cert,
        endpoint,
        type: SET_ADMIN_NETWORK_CERT_MODAL
    }
}

export const setAdminNetworkCertModalShown = (show: boolean): AdminNetworkAndIdentityAction => {
    return {
        show,
        type: TOGGLE_ADMIN_NETWORK_CERT_MODAL_SHOWN
    }
}