/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState from "../../models/state/AdminState";
import { AdminVisualizationAction } from "../../actions/admin/visualizations";


export const setAdminVisualizationPages = (state: AdminState, action: AdminVisualizationAction): AdminState => {
    for (const ev of action.evs!) {
        state.conceptEvents.events.set(ev.id, Object.assign({}, ev));
    }
    return Object.assign({}, state, { 
        conceptEvents: {
            ...state.conceptEvents,
            changed: action.changed,
            events: new Map(state.conceptEvents.events)
        }
    });
};

export const setAdminUneditedVisualizationPage = (state: AdminState, action: AdminVisualizationAction): AdminState => {
    return Object.assign({}, state, { 
        conceptEvents: {
            ...state.conceptEvents,
            uneditedEvent: Object.assign({}, action.ev, { changed: false })
        }
    });
};

export const removeAdminVisualizationPage = (state: AdminState, action: AdminVisualizationAction): AdminState => {
    state.conceptEvents.events.delete(action.ev!.id);
    return Object.assign({}, state, { 
        conceptEvents: { 
            events: new Map(state.conceptEvents.events)
        }
    });
};

export const undoAdminVisualizationPageChange = (state: AdminState, action: AdminVisualizationAction): AdminState => {
    const unedited = state.conceptEvents.uneditedEvent!;

    if (unedited.id) {
        state.conceptEvents.events.set(unedited.id, Object.assign({}, unedited));
    }

    return Object.assign({}, state, { 
        conceptEvents: { 
            changed: false,
            events: new Map(state.conceptEvents.events),
            uneditedEvent: undefined
        }
    });
};