/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 
/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { AuthorizationState } from '../../models/state/AppState';
import { TimelinesState } from '../../models/state/CohortState';
import { DateDisplayMode, DateIncrementType, TimelinesDisplayMode } from '../../models/timelines/Configuration';

interface Props { 
    auth: AuthorizationState;
    patientCount: number;
    timelines: TimelinesState;
}

export default class TimelinesAggregateTitle extends React.Component<Props> {
    private className = 'timelines-chart-title'

    public render() {
        const c = this.className;
        const { auth, patientCount, timelines } = this.props;
        const { dateIncrement } = timelines.configuration;
        const { exportLimit } = auth.config!.cohort;
        const emphClass = `${c}-emphasis`;

        return  (
            <div className={c}>

                {/* Timeline */}
                <div>Timeline </div>

                {/* (limited to n patients) */}
                {patientCount > exportLimit &&
                [<div key={1} className={`${emphClass} ${c}-cohort-limit`}>(limited to {exportLimit} patients)</div>,
                 <div key={2} className={`${c}-cohort-limit-info`}>
                    <span>Your administrator has limited exports of patient data to</span> 
                    <span className={emphClass}>{exportLimit} patients </span>
                    <span>, which Leaf has taken a </span>
                    <span className={emphClass}>robust simple random sample of</span>
                 </div>]
                }

                {/* in increments of x y */}
                <div> of events in increments of</div>
                <div className={emphClass}> {dateIncrement.increment} {this.getIncrementTypeText(dateIncrement.incrementType)} </div>

                {/* Before/After the index event */}
                <div className={emphClass}> {dateIncrement.mode === DateDisplayMode.BEFORE ? 'Before' : 'After'} </div>
                <div> index event</div>
            </div>
        )
    }

    private getIncrementTypeText = (type: DateIncrementType): string => {
        switch (type) {
            case DateIncrementType.DAY:    return 'Days';
            case DateIncrementType.HOUR:   return 'Hours';
            case DateIncrementType.MINUTE: return 'Minutes';
            case DateIncrementType.MONTH:  return 'Months';
            case DateIncrementType.WEEK:   return 'Weeks';
            case DateIncrementType.YEAR:   return 'Years';
        }
    }
}