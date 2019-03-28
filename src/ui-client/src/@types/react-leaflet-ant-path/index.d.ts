/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

declare module "react-leaflet-ant-path" {

    import Leaflet from "leaflet"
    import { PathProps, MapLayer } from "react-leaflet";

    interface IAntPathOptions extends Leaflet.PathOptions {
        paused?: boolean;
        pulseColor?: string;
        delay?: string | number;
        dashArray?: string | any;
    }

    export interface IAntPathProps extends PathProps {
        positions: number[][];
        options?: IAntPathOptions;
    }

    export default class AntPath<P extends IAntPathProps = IAntPathProps, E extends Leaflet.Path = Leaflet.Path> extends MapLayer<P, E> { }
}