/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, LabelList, Cell } from 'recharts';
import { visualizationConfig } from '../../config/visualization';
import { VariableBucketSet } from '../../models/cohort/DemographicDTO';

interface Props {
    bucketset: VariableBucketSet;
    delay: number;
    height: number;
    width: number;
}

interface State {
    showAll: boolean;
    useDelay: boolean;
}

export class Religion extends React.PureComponent<Props,State> {
    private className = 'visualization-religion';
    private maxWidth = 800;
    private defaultDataLength = 20;

    public constructor(props: Props) {
        super(props);
        this.state = {
            showAll: false,
            useDelay: true
        }
    }
    
    public render() {
        const config = visualizationConfig.demographics.religion;
        const { height, width, bucketset, delay } = this.props;
        const { showAll, useDelay } = this.state;
        const c = this.className;
        const w = width > this.maxWidth ? this.maxWidth : width;
        let data = Object.entries(bucketset.subBucketTotals).map(([key,value]) => ({ key, value }) ).sort((a,b) => a.value > b.value ? 0 : 1);

        if (!showAll) {
            data = data.slice(0, this.defaultDataLength);
        }
        
        return (
            <div className={`${c}-column`} style={{ height, width: w }}>
                <div style={{ height }}>
                    <ResponsiveContainer >
                        <BarChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 5}} layout="vertical" >
                            <XAxis type="number" label={{ width: 100 }}/>
                            <YAxis dataKey="key" type="category" interval={0} />
                            <Bar animationBegin={delay} barSize={config.barSize} dataKey="value" isAnimationActive={true} >
                                {data.map((d,i) => <Cell key={d.key} fill={this.color(i,config.colors)} />)}
                                <LabelList dataKey="value" formatter={this.formatNumber} position="right"/>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    private formatNumber = (val: any) => val.toLocaleString();

    private color = (i: number, colors: string[]): string => {
        const last = colors.length-1;
        if (i <= last) {
            return colors[i];
        }
        return colors[Math.floor(i / last)]
    }
}