/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { XAxis, YAxis, Scatter, ScatterChart, ZAxis, Tooltip, CartesianGrid } from 'recharts';
import { deleteConceptDataset } from '../../actions/cohort/timelines';
import { Concept } from '../../models/concept/Concept';
import { AuthorizationState } from '../../models/state/AppState';
import { TimelinesState } from '../../models/state/CohortState';
import { DateIncrementType } from '../../models/timelines/Configuration';
import { TimelinesAggregateDataRow } from '../../models/timelines/Data';
import './AggregateTimelineChart.css';

interface Props {
    auth: AuthorizationState;
    dispatch: any;
    patientCount: number;
    timelines: TimelinesState;
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
        const { auth, patientCount, timelines } = this.props;
        const { dateIncrement } = timelines.configuration;
        const { exportLimit } = auth.config!.cohort;
        const data = [ ...this.props.timelines.aggregateData.concepts.values() ];
        const margins = { top: 0, right: 10, bottom: 0, left: 0 };
        const swimlaneHeight = chartHeight / data.length;
        const lastConcept = data.length-1;
        const dateIncrText = this.getIncrementTypeText(dateIncrement.incrementType);

        return  (
            <div className={c}>
                {data.map((d,i) => {
                    return (
                        <ScatterChart key={d.concept.id} width={chartWidth} height={swimlaneHeight} margin={margins}>

                            {/* Grid */}
                            <CartesianGrid fill={'rgb(245,245,245)'} />

                            {/* X-axis (lower-most chart only) */}
                            {i === lastConcept &&
                            <XAxis type="category" dataKey="timepointId" tick={true} interval={0} axisLine={false} unit={' ' + dateIncrText}/>}

                            {/* Y-axis */}
                            <YAxis type="number" dataKey="displayValueY" domain={[1,1]} axisLine={false} width={150} orientation="right"
                                tick={<CustomizedAxisTick concept={d.concept} clickHandler={this.handleLabelClick}/>}
                            />

                            {/* Z-axis (bubble size) */}
                            <ZAxis type="number" dataKey="displayValueX" domain={[0,5]} range={[0,1000]} />

                            {/* Tooltip */}
                            <Tooltip cursor={false} wrapperStyle={{ zIndex: 100 }} content={this.renderTooltip.bind(null, exportLimit, patientCount)} />

                            {/* Scatter */}
                            <Scatter data={d.data} shape={<CustomizedDot conceptsCount={data.length}/>} />

                        </ScatterChart>
                    );
                })}
            </div>
        )
    }

    private handleLabelClick = (concept: Concept) => {
        const { dispatch } = this.props;
        dispatch(deleteConceptDataset(concept));
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
    }

    private renderTooltip = (exportLimit: number, patientCount: number, props: any) => {
        const { active, payload } = props;
        if (active && payload && payload.length) {
            const data = (payload[0] && payload[0].payload) as TimelinesAggregateDataRow;
            const pct = (data.values.percent * 100).toFixed(1);
            const count = data.values.total;
            const c = 'timelines-aggregate-tooltip';
            const denom = Math.min(patientCount, exportLimit);
    
            return (
                <div className={c}>
                    <span className={`${c}-count`}>{count}</span>
                    <span className={`${c}-denom`}>/{denom}</span>
                    <span> patients </span>
                    <span className={`${c}-subtext`}>(</span>
                    <span className={`${c}-percent`}>{pct}%</span>
                    <span className={`${c}-subtext`}>)</span>
                </div>
          );
        }
        return null;
    };
}

interface TickProps {
    clickHandler: (c: Concept) => void;
    concept: Concept;
    x?: any;
    y?: any;
    payload?: any;
}

const closeX = (
    <svg viewBox='0 0 24 24'>
        <path d='M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z'></path>
    </svg>
);
class CustomizedAxisTick extends React.PureComponent<TickProps> {
    public render () {
        const c = 'timelines-aggregate-yaxis';
        const { x, y, payload, concept, clickHandler } = this.props;
        if (payload.value !== 1) { return null; }
        const text = concept.uiDisplayName.split(' ').length > 1 
            ? concept.uiDisplayName
            : concept.uiDisplayText;

        return (
            <foreignObject className={c} x={x+1} y={y-13}>
                <div className={`${c}-container`} onClick={clickHandler.bind(null, concept)}>
                    <div className={`${c}-remove`}>
                        {closeX}
                    </div>
                    <div className={`${c}-label`} >
                        {text}
                    </div>
                </div>
            </foreignObject>
        );
    }
};

interface DotProps {
    conceptsCount: number;
    cx?: number;
    cy?: number;
    payload?: TimelinesAggregateDataRow;
}

class CustomizedDot extends React.PureComponent<DotProps> {
    public render () {
        const { conceptsCount, cx, cy, payload } = this.props;
        if (!payload || payload.values.total === 0) { return null; }

        return (
            <svg className="timelines-aggregate-dot">
                <circle cx={cx} cy={cy} r={this.getSize(conceptsCount, payload.values.percent)} />
            </svg>
        );
    }

    private getSize = (conceptsCount: number, percent: number): number => {
        const conceptsNoPenaltyLimit = 6;
        const sizeLimitPenalty = 3;
        const sizePadding = 3;
        const maxSize = 40;
        const size = Math.floor(percent * maxSize) + sizePadding;

        if (conceptsCount > conceptsNoPenaltyLimit) {
            const penalty = sizeLimitPenalty * conceptsCount;
            return size - penalty;
        }

        return size;
    }
};