/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Line, LineChart } from 'recharts';
import { XY, PatientListColumnType } from '../../models/patientList/Column';

interface Props {
    className?: string;
    index: number;
    type: PatientListColumnType;
    value: any;
}

interface SparklineDotProps {
    cx: number;
    cy: number;
    dataKey: string;
    fill: string;
    height: number;
    index: number;
    key: string;
    payload: XY;
    r: number;
    stroke: string;
    strokeWidth: number;
    value: number;
    width: number;
}

export default class Tuple extends React.PureComponent<Props> {
    private lastSparklineValIndex: number = 0;
    
    public render() {
        const { className, type } = this.props;
        const c = className ? className : 'patientlist';
        const val = this.getValueDisplay();

        return (
            <td className={`${c}-tuple ${PatientListColumnType[type]}`}>
                {val}
            </td>
        )
    }

    private createSparkline = (vals: XY[]) => {
        if (!vals || !vals.length) { return null; }
        this.lastSparklineValIndex = vals.length - 1;
        return (
            <LineChart width={200} height={40} data={vals} margin={{ top: 8, bottom: 8, left: 5, right: 40 }}>
                <Line 
                    dataKey="y" 
                    dot={this.createSparklineDotAndLabel} 
                    animationBegin={this.props.index * 100} 
                    isAnimationActive={false} 
                    type="linear" 
                    key="0"
                />
            </LineChart> 
        );
    }

    private createSparklineDotAndLabel = (props: SparklineDotProps) => {
        if (props.index === this.lastSparklineValIndex) {
            return (
                <g key="0">
                    <circle cx={props.cx} cy={props.cy} key={props.key} r={2.5} stroke="transparent" strokeWidth={1} fill="#F44336" />
                    <text x={props.cx + 5} y={props.cy} dy={4} key={'0'} textAnchor="right">
                        {props.value}
                    </text>
                </g>
            )
        }
        return null;
    }

    private getValueDisplay = () => {
        const { type, value } = this.props;
        return (
              type === PatientListColumnType.Sparkline ? this.createSparkline(value) 
            : type === PatientListColumnType.DateTime && !!value ? new Date(value).toLocaleString() 
            : value
        );
    }
}