/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { LatLngExpression } from 'leaflet';
import React from 'react'
import DivIcon from 'react-leaflet-div-icon'
import { CohortStateType } from '../../models/state/CohortState';

interface Props
{
    position: LatLngExpression,
    queryState: CohortStateType;
}

export default class EndpointMarker extends React.PureComponent<Props> {
    public render() {
        const classes = [ 'pulse-icon', (this.props.queryState === CohortStateType.LOADED ? 'pulse-icon-loaded' : '') ];
        return (
            <DivIcon className="pulse-icon-wrapper" position={this.props.position}>
                <div className={classes.join(' ')} />
            </DivIcon>
        );
    }
}
