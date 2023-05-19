/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './MaintenanceModal.css';

export default class MaintainenceModal extends React.PureComponent {
    private className = 'maintenance-modal';
    public render() {
        const c = this.className;
        const classes = [ c ];

        return (
            <div className={classes.join(' ')}> 
                <div className={`${c}-inner`}>
                    <div>Maintenance Mode</div>
                </div>
            </div>
        );
    }
}