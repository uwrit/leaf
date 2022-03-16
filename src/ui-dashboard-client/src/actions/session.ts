/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { SessionContext } from '../models/Session';
import { Attestation } from '../models/Session';
import { getSessionTokenAndContext, logoutFromServer, refreshSessionTokenAndContext } from '../services/sessionApi';
import { AuthMechanismType } from '../models/Auth';
import { clearCurrentUserToken, getUserTokenAndContext } from '../services/authApi';
import { receiveIdToken, failureIdToken } from './auth';

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
export const attestAndLoadSession = (attestation: Attestation) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {

        /**
         * Get session token
         */
        dispatch(setSessionLoadState('Submitting Attestation', 5));
        dispatch(submitAttestation(attestation));
        getSessionTokenAndContext(getState(), attestation)
            .then((ctx) => {
                dispatch(setSessionContext(ctx));

                /**
                 * Load data needed for Leaf session
                 */
                dispatch(loadSession(attestation, ctx));
            })
            .catch((reason) => {
                console.log(reason);
                const unauthorized = reason.response && reason.response.status === 401;
                const failMessage = "The Leaf server was found but unexpectedly returned an error, possibly due to an expired access token. Please clear your Leaf browser history and try again.";

                /**
                 * If unauthorized, try to request a new user token and load session again
                 */
                if (unauthorized) {
                    const config = getState().auth.config;
                    getUserTokenAndContext(config!, true)
                        .then((token) => {
                            dispatch(receiveIdToken(token));

                            /**
                             * Try again
                             */
                            getSessionTokenAndContext(getState(), attestation)
                                .then((ctx) => {
                                    dispatch(setSessionContext(ctx));
                                    dispatch(loadSession(attestation, ctx));
                                })
                                .catch(() => dispatch(failureIdToken(failMessage)));
                        })
                        .catch(() => dispatch(failureIdToken(failMessage)));
                }
            });
    };
};

/*
 * Attempt to attest and load data necessary for the session.
 */
export const loadSession = (attestation: Attestation, ctx: SessionContext) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        try {

            dispatch(completeAttestation(ctx.rawDecoded["access-nonce"]));

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
 * Logs the user out and redirects to the designated logoutURI. If using in a 
 * secured mode, notifies the server to blacklist the current session token as well.
 */
export const logout = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        const config = state.auth.config!;
        let logoutUri = config.authentication.logout.uri;

        if (config.authentication.mechanism !== AuthMechanismType.Unsecured) {

            /** 
             * Clear the cached user token, which is now invalidated on the server.
             */
            clearCurrentUserToken(config);

            /**
             * Logout from the server, which will invalidate the current tokens.
             */
            const loggedOut = await logoutFromServer(getState());
        }

        /**
         * If a redirect was provided, go there.
         */
        if (logoutUri) {
            window.location = (logoutUri as any);
        }
        
        /**
         * Else fall back to a hard reload of the Leaf client,
         * which should get caught by the IdP to force a re-login.
         */
        else {
            window.location.reload();
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