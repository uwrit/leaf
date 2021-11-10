/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, LabelList, Tooltip, Legend, LegendPayload } from 'recharts';
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

export class LanguageByHeritage extends React.PureComponent<Props,State> {
    private className = 'visualization-languagebyheritage';
    private maxWidth = 800;
    private xAxisOffset = 200;
    private defaultDataLength = 20;

    public constructor(props: Props) {
        super(props);
        this.state = {
            showAll: false,
            useDelay: true
        }
    }
    
    public render() {
        const config = visualizationConfig.demographics.languageByHeritage;
        const { height, width, bucketset, delay } = this.props;
        const { showAll, useDelay } = this.state;
        const del = useDelay ? delay : 0;
        const c = this.className;
        const w = width > this.maxWidth ? this.maxWidth : width;
        let data: any[] = Object.entries(bucketset.data.buckets).map(([k,v]) => {
            let d: any = { label: k, sum: 0 };
            Object.entries(v.subBuckets).forEach(([sk,sv]) => {
                d[sk] = sv;
                d.sum += sv;
            });
            return d;
        }).sort((a,b) => a.sum > b.sum ? 0 : 1);
        const len = data.length;
        const sums: LanguageSum[] = Object.entries(bucketset.subBucketTotals).map(([k,v],i) => {
            return {
                label: k,
                value: v,
                color: this.color(i, config.colors)
            }
        });

        if (!showAll) {
            data = data.slice(0, this.defaultDataLength);
        }
        
        return (
            <div className={`${c}-column`} style={{ height, width: w }}>

                {/* Show all toggle */}
                {len > this.defaultDataLength &&
                <div className="visualization-showall-toggle">
                    <span className={`visualization-showall false ${showAll ? '' : 'selected'}`} onClick={this.handleShowAllToggleClick.bind(null, false)}>{`Show top ${this.defaultDataLength} only`}</span>
                    <span className={`visualization-showall true ${showAll ? 'selected' : ''}`} onClick={this.handleShowAllToggleClick.bind(null, true)}>{`Show all ${len}`}</span>
                </div>
                }

                {/* Chart */}
                <div style={{ height: height + this.xAxisOffset }}>
                    <ResponsiveContainer >
                        <BarChart width={600} data={data} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                            <XAxis dataKey="label" interval={0} textAnchor="end" height={this.xAxisOffset} tick={<RotatedXAxisTick />} />
                            <YAxis domain={[ 0, dataMax => (dataMax * 1.1) ]}/>
                            <Tooltip />
                            {sums.map((s,i) => {
                                return (
                                    <Bar 
                                        dataKey={s.label}
                                        key={s.label}
                                        stackId="a" 
                                        animationBegin={del} 
                                        barSize={config.barSize} 
                                        fill={s.color}>
                                        {i === (sums.length-1) &&
                                        <LabelList dataKey="sum" position="top" formatter={this.formatNumber} />
                                        }
                                    </Bar>
                                    );
                            })}
                            <Legend layout="vertical" align="right" verticalAlign="top" content={this.renderLegend.bind(null, sums)} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    private formatNumber = (val: any) => val.toLocaleString();

    private renderLegend = (sums: LanguageSum[]) => {
        const sorted = sums.sort((a,b) => a.value === b.value ? 0 : a.value > b.value ? 0 : 1).slice(0,10);
        return (
            <div className="visualization-legend">
               {sorted.map((s) => {
               return (
                <div className="visualization-legend-row" key={s.label}>
                    <div className="visualization-legend-square" style={{ backgroundColor: s.color }}/>
                    <div className="visualization-legend-label">{s.label}</div>
                    <div className="visualization-legend-divider">-</div>
                    <div className="visualization-legend-value">{s.value.toLocaleString()}</div>
                </div>
               )})}
            </div>
        )
    }

    private color = (i: number, colors: string[]): string => {
        const last = colors.length-1;
        if (i <= last) {
            return colors[i];
        }
        return colors[i - (((Math.floor(i / last)) * last)) - 1]
    }

    private handleShowAllToggleClick = (showAll: boolean) => {
        this.setState({ showAll, useDelay: false });
    }
}

interface LanguageSum {
    label: string;
    value: number;
    color: string;
}

interface XAxisProps {
    x?: number;
    y?: number;
    stroke?: string;
    payload?: Payload;
}

interface Payload {
    value: any;
}

class RotatedXAxisTick extends React.PureComponent<XAxisProps> {
    render() {
      const { x, y, payload } = this.props;
      return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={-16} dy={20} textAnchor="end" transform="rotate(-35)">{payload!.value}</text>
        </g>
        );
    }
}