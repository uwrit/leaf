import moment from 'moment';
import React from 'react';
import { IoMdArrowRoundUp as UpArrow, IoMdArrowRoundDown as DownArrow, IoMdArrowRoundForward as RightArrow } from "react-icons/io"
import { BsPersonFill as Person } from "react-icons/bs"
import { TimelineValueSet } from './Timeline';

interface Props {
    color: string;
    comparison: boolean;
    values: TimelineValueSet;
}

export default class DynamicTimelineTrendBar extends React.Component<Props> {
    private className = 'dynamic-timeline-trend-bar';

    public render() {
        const { values, color, comparison } = this.props;
        const { ds, data } = values;
        const c = this.className;
    
        if (!data) { return null; }
        const [ val, date ] = this.getLastValue();

        return (
            <div className={c}>
                <div className={`${c}-arrow`} style={{ color }}>
                    {this.getArrow()}
                </div>
                <div className={`${c}-text-container`}>
                    <div className={`${c}-last-value`} style={{ color }}>
                        <div>{val}</div>
                    </div>
                    <div className={`${c}-name-container`}>
                        <div className={`${c}-name`}>{ds.title}</div>
                        <div className={`${c}-datediff`}>{this.getDateDiff(date)}</div>
                    </div>
                </div>
                {comparison && 
                <div className={`${c}-all-diff`}>
                    +1.1
                </div>
                }
            </div>
        );
    }

    private getDateDiff = (val: Date): string => {
        const then = moment(val);
        const now = moment(new Date());

        for (const pair of [['years','yr'],['months','mo'],['days','dy']]) {
            const [ unit, abbr ] = pair;
            const diff = now.diff(then, unit as any);
            if (diff >= 1) {
                return `${diff} ${unit} ago`;
            }
        }
        return '';
    }

    private getLastValue = (): [number | string | null, any] => {
        const { data, cols } = this.props.values;
        if (!data.length) { return [ "-", null ] }
        const last = data[data.length - 1];
        return [ last[cols.fieldValueNumeric!], last[cols.fieldDate!] ];

    }

    private getArrow = (): JSX.Element => {
        const { data, cols } = this.props.values;
        if (data.length < 2) { return <span>-</span>; }

        const last = data[data.length - 1][cols.fieldValueNumeric!];
        const prev = data[data.length - 2][cols.fieldValueNumeric!];

        if (!last || !prev) { return <Person />; }
        if (last < prev)   { return <DownArrow /> }
        if (last === prev) { return <RightArrow /> }

        return <UpArrow />
    }
};