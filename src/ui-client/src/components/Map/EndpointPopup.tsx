/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react'
import CountUp from 'react-countup';
import { Popup } from 'react-leaflet'
import { NetworkIdentity } from '../../models/NetworkResponder';
import './EndpointPopup.css'

interface Props {
    id: NetworkIdentity;
    count: number;
}

export default class EndpointPopup extends React.PureComponent<Props> {
    public render() {
        const { id } = this.props;
        const countDisplay = 
            <CountUp className="cohort-summary-count-number" 
                start={0} 
                end={this.props.count} 
                duration={1.0} 
                decimals={0} 
                formattingFn={this.formatNumber} 
            />;

        if (!id.latitude || !id.longitude) { return null; }
        

        return (
            <Popup position={[ +id.latitude, +id.longitude ]} 
                   closeOnClick={false} 
                   autoClose={false} 
                   closeButton={false} 
                   closeOnEscapeKey={false}>
                <div className="endpoint-popup-wrapper">
                    <div className="endpoint-popup-body">
                        <span className="endpoint-popup-patients">
                            {countDisplay}
                        </span>
                    </div>
                    <div className="endpoint-popup-header">
                        <div className="endpoint-popup-header-name" style={{ color: id.primaryColor }}>{id.name}</div>
                    </div>
                </div>
            </Popup>
        );
    }

    private formatNumber = (value: number) => value.toLocaleString();
}
