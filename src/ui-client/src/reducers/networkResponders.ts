/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { DISABLE_Responder, ENABLE_Responder, ERROR_Responder, NetworkRespondersAction, SET_ResponderS } from '../actions/networkResponders';
import { NetworkIdentity, NetworkResponderMap } from '../models/NetworkResponder';

export function defaultRespondersState(): NetworkResponderMap {
    return new Map<number, NetworkIdentity>();
}

function setResponders(state: NetworkResponderMap, eps: NetworkIdentity[]): NetworkResponderMap {
    const newState = new Map<number, NetworkIdentity>();
    eps!.forEach(e => {
        // Leaflet expect longitudes to be negative
        if (e.longitude > 0) {
            e.longitude = -e.longitude;
        }
        newState.set(e.id, e)
    });
    return newState;
}

function setResponderError(state: NetworkResponderMap, id: number): NetworkResponderMap {
    // TODO: need to indicate error state for responder
    return state;
}

function toggleEnabled(state: NetworkResponderMap, id: number, enabled: boolean): NetworkResponderMap {
    const newState = new Map(state);
    const newResponderState = Object.assign({}, state.get(id)!);
    newResponderState.enabled = enabled;
    newState.set(id, newResponderState);
    return newState;
}

export const responders = (state: NetworkResponderMap = defaultRespondersState(), action: NetworkRespondersAction): NetworkResponderMap => {

    switch (action.type) {
        case SET_ResponderS:
            return setResponders(state, action.responders!);
        case ERROR_Responder:
            return setResponderError(state, action.id!);
        case ENABLE_Responder:
            return toggleEnabled(state, action.id!, true);
        case DISABLE_Responder:
            return toggleEnabled(state, action.id!, false);
        default:
            return state;
    }
}