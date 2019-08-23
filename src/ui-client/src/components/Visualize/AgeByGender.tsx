/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { visualizationConfig } from '../../config/visualization';
import { AgeByGenderBucket, AgeByGenderData } from '../../models/cohort/DemographicDTO';

export interface Props {
    data: AgeByGenderData;
    height: number;
    width: number;
}

export class AgeByGender extends React.PureComponent<Props> {
    private className = 'visualization-agebygender';
    private maxWidth = 500;
    
    public render() {
        const config = visualizationConfig.demographics.ageByGender;
        const { height, width } = this.props;
        const c = this.className;
        const w = width > this.maxWidth ? this.maxWidth : width;
        const stackHeight = height / 2;
        const data: AgeByGenderBucket[] = Object.keys(this.props.data.buckets)
            .map((d: string) => {
                const bucket = this.props.data.buckets[d];
                return {
                    ...bucket,
                    label: d,
                    sum: bucket.females + bucket.males + bucket.others
                }
            });
        
        return (
            <div className={`${c}-column`} style={{ height, width: w }}>
                <div style={{ height: stackHeight }}>
                    <ResponsiveContainer >
                        <BarChart data={data} barSize={config.barSize} barCategoryGap={config.barCategoryGap} className={`${c}-female`}
                                margin={{top: 20, right: 0, left: 0, bottom: 10}} >
                            <XAxis dataKey="label" type="category" interval={0} />
                            <YAxis label={{ value: "Females", dx: -5 }} width={75} />
                            <Bar dataKey="females" fill={config.colorFemale} >
                                <LabelList dataKey="females" position="top" formatter={this.formatNumber} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ height: stackHeight }}>
                    <ResponsiveContainer >
                        <BarChart data={data} barSize={config.barSize} barCategoryGap={config.barCategoryGap} className={`${c}-male`}
                                margin={{top: 20, right: 0, left: 0, bottom: 10}} >
                            <XAxis dataKey="label" type="category" interval={0} />
                            <YAxis label={{ value: "Males", dx: -5 }} width={75} />
                            <Bar dataKey="males" fill={config.colorMale} >
                                <LabelList dataKey="males" position="top" formatter={this.formatNumber} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    private formatNumber = (val: any) => val.toLocaleString();
}