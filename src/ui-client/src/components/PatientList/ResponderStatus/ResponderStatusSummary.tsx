/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { NetworkCohortState, CohortStateType } from '../../../models/state/CohortState';
import { NetworkIdentity, NetworkResponderMap } from '../../../models/NetworkResponder';
import ResponderStatus from './ResponderStatus';
import './ResponderStatus.css';

interface Props {
    cohortMap: Map<number, NetworkCohortState>;
    responderMap: NetworkResponderMap;
}

interface CohortResponder {
    cohort: NetworkCohortState;
    responder: NetworkIdentity;
}

export default class ResponderStatusSummary extends React.PureComponent<Props> {
    private classname = 'patientlist-responder-status-summary'
    
    public render() {
        const c = this.classname;
        const { cohortMap, responderMap } = this.props;
        const cohorts: CohortResponder[] = [];
        let completed = 0;
        cohortMap.forEach((nc: NetworkCohortState) => {
            const r = responderMap.get(nc.id)!;
            if (r.enabled && nc.count.state === CohortStateType.LOADED) {
                cohorts.push({ cohort: nc, responder: r });
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
                {cohorts.map((nc: CohortResponder) => (
                    <ResponderStatus cohort={nc.cohort} key={nc.cohort.id} responder={nc.responder} />)
                )}
            </div>
        );
    }
}
