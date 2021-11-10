/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { AuthorizationState } from '../../models/state/AppState';
import { TimelinesState } from '../../models/state/CohortState';
import { DateDisplayMode, DateIncrementType, TimelinesDisplayMode } from '../../models/timelines/Configuration';
import './TimelinesChartTitle.css';

interface Props { 
    auth: AuthorizationState;
    patientCount: number;
    timelines: TimelinesState;
}

export default class TimelinesChartTitle extends React.Component<Props> {
    private className = 'timelines-chart-title'

    public render() {
        const c = this.className;
        const { timelines } = this.props;
        const { mode } = timelines.configuration;

        /*
        if (isNaN(timelines.configuration.dateIncrement.increment)) {
            return null;
        }
        */

        return  (
            <div className={c}>
                <div className={`${c}-inner`}>

                    {/* Aggreggate */}
                    {mode === TimelinesDisplayMode.AGGREGATE && 
                    this.getAggregateChartTitle()}

                </div>
            </div>
        );
    }

    private getAggregateChartTitle = () => {
        const c = this.className;
        const { auth, patientCount, timelines } = this.props;
        const { dateIncrement } = timelines.configuration;
        const { exportLimit } = auth.config!.cohort;
        const emphClass = `${c}-emphasis`;

        return (
            <div>

                {/* Timeline */}
                <div>Timeline</div>

                {/* (limited to n patients) */}
                {patientCount > exportLimit &&
                <div className={`${emphClass} ${c}-cohort-limit`}>(limited to {exportLimit} patients)
                    <div className={`${c}-cohort-limit-info`}>
                        <span>Your administrator has limited exports of patient data to</span> 
                        <span className={emphClass}>{exportLimit} patients.</span>
                        <br></br>
                        <span>Leaf extracted a</span>
                        <span className={emphClass}>simple random sample</span>
                        <span>to generate the data below.</span>
                    </div>
                </div>
                }

                {/* of x y increments */}
                <div>of</div>
                <div className={emphClass}>{dateIncrement.increment} {this.getIncrementTypeText(dateIncrement.incrementType)}</div>
                <div>increments</div>

                {/* Before/After index event */}
                <div className={emphClass}>{this.getDisplayModeText(dateIncrement.mode)}</div>
                <div>index event</div>

            </div>
        );
    }

    private getDisplayModeText = (mode: DateDisplayMode): string => {
        if (mode === DateDisplayMode.BEFORE_AND_AFTER) return "Before and After"; 
        else if (mode === DateDisplayMode.BEFORE)      return "Before"; 
        return "After";
    }

    private getIncrementTypeText = (type: DateIncrementType): string => {
        switch (type) {
            case DateIncrementType.DAY:    return 'Day';
            case DateIncrementType.HOUR:   return 'Hour';
            case DateIncrementType.MINUTE: return 'Minute';
            case DateIncrementType.MONTH:  return 'Month';
            case DateIncrementType.WEEK:   return 'Week';
            case DateIncrementType.YEAR:   return 'Year';
        }
    }
}