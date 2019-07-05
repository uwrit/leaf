/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row } from 'reactstrap';
import { Bar, BarChart, Cell, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { visualizationConfig } from '../../config/visualization';
import { BinarySplit, BinarySplitPair} from '../../models/cohort/DemographicDTO';

export interface Props {
    data: BinarySplitPair[];
    height: number;
    width: number;
}

export class Binary extends React.PureComponent<Props> {
    private maxColWidth = 260;

    constructor(props: Props) {
        super(props);
    }

    public render() {
        const config = visualizationConfig.demographics.binary;
        const animationDelay = 300;
        const { height, width } = this.props;
        const colWidth = (width / 2) > this.maxColWidth ? this.maxColWidth : (width / 2);
        const leftBars = this.props.data
            .map((d: BinarySplitPair) => {
                const val = d.left;
                return {
                    ...val,
                    color: config.colors[d.category].left,
                    dummyValue: 0,
                    value: -val.value
                };
            });
        const rightBars = this.props.data
            .map((d: BinarySplitPair) => {
                const val = d.right;
                return {
                    ...val,
                    color: config.colors[d.category].right,
                    dummyValue: 0
                };
            });

        if (!leftBars.length && !rightBars.length) { return null; }

        return (
            <Row >
                <div className="visualization-ataglance-column visualization-ataglance-left" style={{ height, width: colWidth }}>
                    <ResponsiveContainer>
                        <BarChart data={leftBars} barCategoryGap={1} layout={'vertical'} margin={{top: 50, right: 0, left: 50, bottom: 50}}>
                            <XAxis type="number" hide={true}/>
                            <Bar barSize={1} dataKey="dummyValue" isAnimationActive={false}>
                                <LabelList dataKey="label" position="insideBottomRight" />
                            </Bar>
                            <Bar animationBegin={animationDelay} barSize={config.barSize} dataKey="value" isAnimationActive={true} >
                                {leftBars.map((d: BinarySplit) => <Cell key={d.label} fill={d.color} />)}
                                <LabelList dataKey="value" formatter={this.formatNegativeNumber} position="insideRight"/>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="visualization-ataglance-column visualization-ataglance-right" style={{ height, width: colWidth }}>
                    <ResponsiveContainer>
                        <BarChart data={rightBars} barCategoryGap={2} layout={'vertical'} margin={{top: 50, right: 50, left: 0, bottom: 50}}>
                            <XAxis type="number" hide={true}/>
                            <Bar barSize={1} dataKey="dummyValue" isAnimationActive={false}>
                                <LabelList dataKey="label" position="insideBottomLeft" />
                            </Bar>
                            <Bar animationBegin={animationDelay} barSize={config.barSize} dataKey="value" isAnimationActive={true} >
                                {rightBars.map((d: BinarySplit) => <Cell key={d.label} fill={d.color} />)}
                                <LabelList dataKey="value" position="right" formatter={this.formatNumber} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Row>);
    }

    private formatNegativeNumber = (d: any) => Math.abs(+d).toLocaleString(); 

    private formatNumber = (val: any) => val.toLocaleString();
}

