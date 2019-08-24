/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { CohortStateType, NetworkCohortState } from '../../../models/state/CohortState';
import { NetworkIdentity } from '../../../models/NetworkResponder';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon';

interface Props {
    cohort: NetworkCohortState;
    responder: NetworkIdentity;
}

export default class ResponderStatus extends React.PureComponent<Props> {
    private classname = 'patientlist-responder-status'
    
    public render() {
        const c = this.classname;
        const { responder } = this.props;
        return (
            <div className={c}>
                <div className={`${c}-abbr`} style={{ color: responder.primaryColor }}>{responder.name}</div>
                <div className={`${c}-state`}>{this.getStateDisplay()}</div>
            </div>
        );
    }

    private getStateDisplay = () => {
        switch (this.props.cohort.patientList.state) {
            case CohortStateType.IN_ERROR:
                return <span>Error!</span>;
            case CohortStateType.LOADED:
                return <span>Loaded</span>;
            case CohortStateType.NOT_LOADED:
                return <span>Not loaded</span>;
            case CohortStateType.REQUESTING:
                return <span><LoaderIcon size={15} /></span>;
            default:
                return null;
        }
    }
}
