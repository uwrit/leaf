/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './SectionHeader.css';

export interface Props {
    headerText: string;
    subText?: string;
}

export class SectionHeader extends React.PureComponent<Props> {
    public render() {
        return (
            <div className="section-header">
                <h3>{this.props.headerText}</h3>
                {this.props.subText && 
                    <small>{this.props.subText}</small>
                }
            </div>
        );
    }
}