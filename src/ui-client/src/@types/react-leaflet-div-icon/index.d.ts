/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

declare module "react-leaflet-div-icon" {

    import Leaflet from "leaflet"
    import React from "react";
    import { MapLayerProps, MapLayer } from "react-leaflet";

    export interface IDivIconProps extends MapLayerProps, Leaflet.MarkerOptions {
        position: Leaflet.LatLngExpression;
    }

    export default class DivIcon<P extends IDivIconProps = IDivIconProps, E extends Leaflet.DivIcon = Leaflet.DivIcon> extends MapLayer<P, E> { }
}