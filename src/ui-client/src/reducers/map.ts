/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { LatLngBounds } from 'leaflet';
import { MapAction, SET_VIEWPORT } from '../actions/map';
import { MapState } from '../models/state/AppState';
import { Viewport } from '../models/state/Map';

const centerOfUS: number[] = [ 42.76314586689494, -95.70117187500001 ];
const defaultBounds: LatLngBounds = new LatLngBounds([ [47.6062, -122.3321], [39.3299, -76.6205] ]);

export function defaultMapState(): MapState {
    return {
        viewport: {
            bounds: defaultBounds,
            center: centerOfUS,
            zoom: 5
        }
    } as MapState;
}

export function setViewport(state: MapState, newView: Viewport): MapState {

    return Object.assign({}, state, {
        ...state,
        viewport: newView
    });
}

export const map = (state: MapState = defaultMapState(), action: MapAction): MapState => {

    switch (action.type) {
        case SET_VIEWPORT:
            return setViewport(state, action.viewport!);
        default:
            return state;
    }
}