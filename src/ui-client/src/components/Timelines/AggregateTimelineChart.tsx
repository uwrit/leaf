/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { XAxis, YAxis, Scatter, ScatterChart, ZAxis, Text, Tooltip, CartesianGrid, Dot } from 'recharts';
import { DateIncrementType } from '../../models/panel/Date';
import { TimelinesState } from '../../models/state/CohortState';
import { TimelinesAggregateDataRow } from '../../models/timelines/Data';
import './AggregateTimelineChart.css';

interface Props { 
    data: TimelinesState;
}

interface State {
    chartHeight: number;
    chartWidth: number;
}

export default class AggregateTimelineChart extends React.Component<Props, State> {
    private className = 'timelines-aggregate'

    constructor(props: Props) {
        super(props);
        const dims = this.getChartDimensions();
        this.state = {
            chartHeight: dims.height,
            chartWidth: dims.width
        }
    }

    public componentDidMount() {
        window.addEventListener('resize', this.updateChartDimensions);
        this.updateChartDimensions();
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateChartDimensions);
    }

    private updateChartDimensions = () => {
        const dims = this.getChartDimensions();
        this.setState({ chartHeight: dims.height, chartWidth: dims.width });
    }

    private getChartDimensions = () => {
        const chartElem = document.getElementsByClassName('timelines-chart')
        if (chartElem.length) {
            return {
                width: chartElem[0].getClientRects()[0].width,
                height: chartElem[0].getClientRects()[0].height
            };
        }
        return { width: 800, height: 800 };
    }

    public render() {
        const c = this.className;
        const { chartWidth, chartHeight } = this.state;
        const { dateIncrement } = this.props.data.configuration;
        const data = [ ...this.props.data.aggregateData.concepts.values() ];
        const margins = { top: 0, right: 10, bottom: 0, left: 0 };
        const swimlaneHeight = chartHeight / data.length;
        const lastConcept = data.length-1;

        return  (
            <div className={c}>
                {data.map((d,i) => {
                    return (
                        <ScatterChart key={d.concept.id} width={chartWidth} height={swimlaneHeight} margin={margins}>
                            <CartesianGrid fill={'rgb(245,245,245)'} />
                            {i === lastConcept &&
                            <XAxis type="category" dataKey="timepointId" tick={true} interval={0} axisLine={false} unit={this.getIncrementTypeText(dateIncrement.incrementType)} />
                            }
                            <YAxis type="number" dataKey="displayValueY" domain={[1,1]} axisLine={false} width={150} orientation="right"
                                tick={<CustomizedAxisTick text={d.concept.uiDisplayName} />} 
                            />
                            <ZAxis type="number" dataKey="displayValueX" domain={[0,5]} range={[0,1000]} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} wrapperStyle={{ zIndex: 100 }} content={this.renderTooltip} />
                            <Scatter data={d.data} shape={<CustomizedDot/>} />
                        </ScatterChart>
                    );
                })}
            </div>
        )
    }

    private getIncrementTypeText = (type: DateIncrementType): string => {
        switch (type) {
            case DateIncrementType.DAY:    return 'days';
            case DateIncrementType.HOUR:   return 'hours';
            case DateIncrementType.MINUTE: return 'minutes';
            case DateIncrementType.MONTH:  return 'months';
            case DateIncrementType.WEEK:   return 'weeks';
            case DateIncrementType.YEAR:   return 'years';
        }
        return '';
    }

    private renderTooltip = (props: any) => {
        const { active, payload } = props;
        if (active && payload && payload.length) {
            const data = (payload[0] && payload[0].payload) as TimelinesAggregateDataRow;
            const pct = (data.values.percent * 100).toFixed(1);
            const count = data.values.total;
            const c = 'timelines-aggregate-tooltip';
    
            return (
                <div className={c}>
                    <span className={`${c}-count`}>{count}</span>
                    <span>patients (</span>
                    <span className={`${c}-percent`}>{pct}%</span>
                    <span>)</span>
                </div>
          );
        }
        return null;
    };
}

interface TickProps {
    text: string;
    x?: any;
    y?: any;
    payload?: any;
}

class CustomizedAxisTick extends React.PureComponent<TickProps> {
    public render () {
        const { x, y, payload, text } = this.props;
        if (payload.value !== 1) { return null;}
        const data = payload as TimelinesAggregateDataRow;
        console.log(data);

        return (
            <Text 
                className="timelines-aggregate-yaxis-label" 
                x={x+5} y={y-4} width={150} 
                textAnchor="start" 
                verticalAnchor="start"
                >
                    {text}
            </Text>
        );
    }

};

interface DotProps {
    cx?: number;
    cy?: number;
    payload?: TimelinesAggregateDataRow;
}

class CustomizedDot extends React.PureComponent<DotProps> {
    public render () {
        const { cx, cy, payload } = this.props;
        if (!payload || payload.values.total === 0) { return null; }

        return (
            <svg className="timelines-aggregate-dot">
                <circle cx={cx} cy={cy} r={this.getSize(payload)} />
            </svg>
        );
    }

    private getSize = (payload: TimelinesAggregateDataRow): number => {
        const minSize = 3;
        const maxSize = 40;
        const size = Math.floor(payload.values.percent * maxSize);

        if (size < minSize) {
            return minSize;
        }
        return size;
    }
};