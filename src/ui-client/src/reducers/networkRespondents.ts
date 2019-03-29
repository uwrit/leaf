/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { DISABLE_RESPONDENT, ENABLE_RESPONDENT, ERROR_RESPONDENT, NetworkRespondentsAction, SET_RESPONDENTS } from '../actions/networkRespondents';
import { NetworkIdentity, NetworkRespondentMap } from '../models/NetworkRespondent';

export function defaultRespondentsState(): NetworkRespondentMap {
    return new Map<number, NetworkIdentity>();
}

function setRespondents(state: NetworkRespondentMap, eps: NetworkIdentity[]): NetworkRespondentMap {
    const newState = new Map<number, NetworkIdentity>();
    eps!.forEach(e => newState.set(e.id, e));
    return newState;
}

function setRespondentError(state: NetworkRespondentMap, id: number): NetworkRespondentMap {
    // TODO: need to indicate error state for respondent
    return state;
}

function toggleEnabled(state: NetworkRespondentMap, id: number, enabled: boolean): NetworkRespondentMap {
    const newState = new Map(state);
    const newRespondentState = Object.assign({}, state.get(id)!);
    newRespondentState.enabled = enabled;
    newState.set(id, newRespondentState);
    return newState;
}

export const respondents = (state: NetworkRespondentMap = defaultRespondentsState(), action: NetworkRespondentsAction): NetworkRespondentMap => {

    switch (action.type) {
        case SET_RESPONDENTS:
            return setRespondents(state, action.respondents!);
        case ERROR_RESPONDENT:
            return setRespondentError(state, action.id!);
        case ENABLE_RESPONDENT:
            return toggleEnabled(state, action.id!, true);
        case DISABLE_RESPONDENT:
            return toggleEnabled(state, action.id!, false);
        default:
            return state;
    }
}