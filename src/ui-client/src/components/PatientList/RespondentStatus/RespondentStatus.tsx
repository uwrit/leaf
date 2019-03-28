/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { CohortStateType, NetworkCohortState } from '../../../models/state/CohortState';
import { NetworkIdentity } from '../../../models/NetworkRespondent';

interface Props {
    cohort: NetworkCohortState;
    respondent: NetworkIdentity;
}

export default class RespondentStatus extends React.PureComponent<Props> {
    private classname = 'patientlist-respondent-status'
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const c = this.classname;
        const { cohort, respondent } = this.props;
        return (
            <div className={c}>
                <div className={`${c}-abbr`} style={{ color: respondent.primaryColor }}>{respondent.name}</div>
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
                return <span>Requesting data...</span>;
            default:
                return null;
        }
    }
}
