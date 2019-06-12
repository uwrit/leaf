/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { NetworkIdentity } from "../../models/NetworkResponder";
import { NetworkEndpoint } from "../../models/admin/Network";
import { AppState } from "../../models/state/AppState";
import { createEndpoint, updateEndpoint, deleteEndpoint, getCertificate } from "../../services/admin/networkAndIdentityApi";
import { setNoClickModalState, showInfoModal } from "../generalUi";
import { NoClickModalStates, InformationModalState } from "../../models/state/GeneralUiState";
import { getApiUpdateQueue } from "../../utils/admin/networkAndidentity";
import { setResponder } from "../networkResponders";

export const SET_ADMIN_NETWORK_IDENTITY = 'SET_ADMIN_NETWORK_IDENTITY';
export const SET_ADMIN_NETWORK_ENDPOINT = 'SET_ADMIN_NETWORK_ENDPOINT';
export const SET_ADMIN_NETWORK_ENDPOINTS = 'SET_ADMIN_NETWORK_ENDPOINTS';
export const REMOVE_ADMIN_NETWORK_ENDPOINT = 'REMOVE_ADMIN_NETWORK_ENDPOINT';
export const REVERT_ADMIN_NETWORK_CHANGES = 'REVERT_ADMIN_NETWORK_CHANGES';

export interface AdminNetworkAndIdentityAction {
    changed?: boolean;
    endpoint?: NetworkEndpoint;
    endpoints?: NetworkEndpoint[];
    identity?: NetworkIdentity;
    type: string;
}

// Asynchronous
/*
 * Process all queued Network Identity & Endpoint API operations sequentially.
 */
export const processApiUpdateQueue = () => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        dispatch(setNoClickModalState({ message: "Saving", state: NoClickModalStates.CallingServer }));

        try {
            const queue = getApiUpdateQueue(state.admin!.networkAndIdentity, dispatch, state);
            for (const process of queue) {
                await process();
            }

            // All done!
            dispatch(setResponder(state.admin!.networkAndIdentity.identity));
            dispatch(setAdminNetworkIdentity(state.admin!.networkAndIdentity.identity, false));
            dispatch(setNoClickModalState({ message: "Saved", state: NoClickModalStates.Complete }));
        } catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "An error occurred while attempting update the Leaf database with your changes. Please see the Leaf error logs for details.",
                header: "Error Applying Changes",
                show: true
            };
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
            dispatch(showInfoModal(info));
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
            dispatch(setNoClickModalState({ message: "Deleting", state: NoClickModalStates.CallingServer }));
            deleteEndpoint(state, endpoint)
                .then(
                    response => {
                        dispatch(setNoClickModalState({ message: "Deleted", state: NoClickModalStates.Complete }));
                        dispatch(removeAdminNetworkEndpoint(endpoint));
                },  error => {
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        const info: InformationModalState = {
                            body: "An error occurred while attempting to delete the Concept Specialization. Please see the Leaf error logs for details.",
                            header: "Error Deleting Concept Specialization",
                            show: true
                        };
                        dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
                        dispatch(showInfoModal(info));
                });
        } catch (err) {
            console.log(err);
        }
    }
};

/*
 * Test and attempt to load remote Leaf instance cert
 * info based on current URL.
 */
export const attemptRemoteLeafCertCall = (endpoint: NetworkEndpoint) => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            dispatch(setNoClickModalState({ message: "Phoning a friend...", state: NoClickModalStates.CallingServer }));
            const cert = await getCertificate(getState(), endpoint.address);
            console.log(cert);
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Complete }));
        } catch (err) {
            dispatch(setNoClickModalState({ message: "", state: NoClickModalStates.Hidden }));
        }
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