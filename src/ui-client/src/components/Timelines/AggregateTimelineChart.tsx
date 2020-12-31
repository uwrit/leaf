/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ResponsiveContainer, XAxis, YAxis, Scatter, ScatterChart, ZAxis, Legend, Tooltip } from 'recharts';
import { TimelinesState } from '../../models/state/CohortState';
import './AggregateTimelineChart.css';

interface Props { 
    timelines: TimelinesState;
}

export default class AggregateTimelineChart extends React.Component<Props> {
    private className = 'timelines-aggregate'

    public updateDimensions = () => {
    }

    public componentWillMount() {
        this.updateDimensions();
    }

    public componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    public render() {
        const c = this.className;

        return  (
            <div>
                <ResponsiveContainer >
                    <ScatterChart width={730} height={250}
                        margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                        <XAxis dataKey="x" name="stature" unit="cm" />
                        <YAxis dataKey="y" name="weight" unit="kg" />
                        <ZAxis dataKey="z" range={[64, 144]} name="score" unit="km" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="A school" data={[]} fill="#8884d8" />
                        <Scatter name="B school" data={[]} fill="#82ca9d" />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        )
    }
}