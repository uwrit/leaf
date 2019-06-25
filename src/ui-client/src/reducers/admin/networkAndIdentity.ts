/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Dcateloped by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { NetworkIdentity, RuntimeMode } from "../../models/NetworkResponder";
import { AdminNetworkAndIdentityAction } from "../../actions/admin/networkAndIdentity";
import AdminState from "../../models/state/AdminState";
import { NetworkEndpoint } from "../../models/admin/Network";

export const getDefaultIdentity = (): NetworkIdentity => {
    return {
        abbreviation: '',
        address: '',
        enabled: true,
        id: 0,
        isGateway: false,
        isHomeNode: true,
        name: '',
        runtime: RuntimeMode.Full,
        primaryColor: '',
        secondaryColor: ''
    }
 };

export const setAdminNetworkIdentity = (state: AdminState, action: AdminNetworkAndIdentityAction): AdminState => {
    let unedited = state.networkAndIdentity.uneditedIdentity;

    if (!action.changed) {
        unedited = Object.assign({}, action.identity);
    }

    return Object.assign({}, state, {
        networkAndIdentity: {
            ...state.networkAndIdentity,
            changed: action.changed,
            identity: action.identity,
            uneditedIdentity: unedited
        }
    });
};

export const setAdminNetworkEndpoint = (state: AdminState, action: AdminNetworkAndIdentityAction): AdminState => {
    state.networkAndIdentity.endpoints.set(action.endpoint!.id, action.endpoint!);

    return Object.assign({}, state, {
        networkAndIdentity: {
            ...state.networkAndIdentity,
            changed: action.changed,
            endpoints: new Map(state.networkAndIdentity.endpoints),
            uneditedEndpoints: action.changed 
                ? state.networkAndIdentity.uneditedEndpoints 
                : new Map(state.networkAndIdentity.endpoints)
        }
    });
};

export const removeAdminNetworkEndpoint = (state: AdminState, action: AdminNetworkAndIdentityAction): AdminState => {
    state.networkAndIdentity.endpoints.delete(action.endpoint!.id);
    state.networkAndIdentity.uneditedEndpoints.delete(action.endpoint!.id);

    return Object.assign({}, state, {
        networkAndIdentity: {
            ...state.networkAndIdentity,
            endpoints: new Map(state.networkAndIdentity.endpoints),
        }
    });
};

export const setAdminNetworkEndpoints = (state: AdminState, action: AdminNetworkAndIdentityAction): AdminState => {
    const endpoints: Map<number, NetworkEndpoint> = new Map();
    action.endpoints!.forEach((e) => endpoints.set(e.id, e));

    return Object.assign({}, state, {
        networkAndIdentity: {
            ...state.networkAndIdentity,
            endpoints,
            uneditedEndpoints: new Map(endpoints)
        }
    });
};

export const revertAdminNetworkChanges = (state: AdminState, action: AdminNetworkAndIdentityAction): AdminState => {
    return Object.assign({}, state, {
        networkAndIdentity: {
            ...state.networkAndIdentity,
            changed: false,
            endpoints: new Map(state.networkAndIdentity.uneditedEndpoints),
            identity: state.networkAndIdentity.uneditedIdentity
        }
    });
};

export const setAdminNetworkCertModalContent = (state: AdminState, action: AdminNetworkAndIdentityAction): AdminState => {
    return Object.assign({}, state, {
        networkAndIdentity: {
            ...state.networkAndIdentity,
            modal: {
                show: true,
                cert: action.cert,
                endpoint: action.endpoint
            }
        }
    });
};

export const setAdminNetworkCertModalShown = (state: AdminState, action: AdminNetworkAndIdentityAction): AdminState => {
    return Object.assign({}, state, {
        networkAndIdentity: {
            ...state.networkAndIdentity,
            modal: {
                ...state.networkAndIdentity.modal,
                show: action.show
            }
        }
    });
};
