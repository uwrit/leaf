/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { 
    COMPLETE_ATTESTATION, 
    SessionAction, 
    SET_ACCESS_TOKEN, 
    SET_SESSION_LOAD_STATE, 
    SUBMIT_ATTESTATION, 
    ERROR_ATTESTATION 
} from '../actions/session';
import { Attestation, SessionContext, SessionState } from '../models/Session';

export function defaultSessionState(): SessionState {
    return {
        hasAttested: false,
        isSubmittingAttestation: false,
        loadingDisplay: '',
        loadingProgressPercent: 0,
    };
};

const receiveAttestationConfirmation = (state: SessionState, nonce: string): SessionState => {
    return Object.assign({}, state, {
        attestation: {
            ...state.attestation,
            nonce
        },
        hasAttested: true,
        isSubmittingAttestation: false
    });
};

const submitAttestation = (state: SessionState, attestation: Attestation): SessionState => {
    return Object.assign({}, state, {
        attestation,
        isSubmittingAttestation: true,
    });
};

const setSessionLoadState = (state: SessionState, loadingProgressPercent: number, loadingDisplay: string): SessionState => {
    return Object.assign({}, state, {
        loadingDisplay,
        loadingProgressPercent
    });
};

const setContext = (state: SessionState, context: SessionContext): SessionState => {
    return Object.assign({}, state, {
        context
    });
};

const setError = (state: SessionState, error: boolean): SessionState => {
    return Object.assign({}, state, {
        error
    });
};

export const session = (state: SessionState = defaultSessionState(), action: SessionAction): SessionState => {
    switch (action.type) {
        case SUBMIT_ATTESTATION:
            return submitAttestation(state, action.attestation!);
        case SET_SESSION_LOAD_STATE:
            return setSessionLoadState(state, action.sessionLoadProgressPercent!, action.sessionLoadDisplay!);
        case COMPLETE_ATTESTATION:
            return receiveAttestationConfirmation(state, action.nonce!);
        case SET_ACCESS_TOKEN:
            return setContext(state, action.context!);
        case ERROR_ATTESTATION:
            return setError(state, action.error!);
        default:
            return state;   
    };
};