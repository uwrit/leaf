/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { NetworkCohortState, CohortStateType } from '../../../models/state/CohortState';
import { NetworkIdentity, NetworkRespondentMap } from '../../../models/NetworkRespondent';
import RespondentStatus from './RespondentStatus';
import './RespondentStatus.css';

interface Props {
    cohortMap: Map<number, NetworkCohortState>;
    respondentMap: NetworkRespondentMap;
}

interface CohortRespondent {
    cohort: NetworkCohortState;
    respondent: NetworkIdentity;
}

export default class RespondentStatusSummary extends React.PureComponent<Props> {
    private classname = 'patientlist-respondent-status-summary'
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const c = this.classname;
        const { cohortMap, respondentMap } = this.props;
        const cohorts: CohortRespondent[] = [];
        let completed = 0;
        cohortMap.forEach((nc: NetworkCohortState) => {
            const r = respondentMap.get(nc.id)!;
            if (r.enabled && nc.count.state === CohortStateType.LOADED) {
                cohorts.push({ cohort: nc, respondent: r });
            }
            if (nc.patientList.state === CohortStateType.LOADED) {
                completed++;
            }
        });

        return (
            <div className={c}>
                <div className={`${c}-stats`}>
                    <span className={`${c}-completed`}>{completed} </span> 
                    <span> of </span>
                    <span className={`${c}-total`}> {cohorts.length} </span>
                    <span> sites complete</span>
                </div>
                {cohorts.map((nc: CohortRespondent) => (
                    <RespondentStatus cohort={nc.cohort} key={nc.cohort.id} respondent={nc.respondent} />)
                )}
            </div>
        );
    }
}
