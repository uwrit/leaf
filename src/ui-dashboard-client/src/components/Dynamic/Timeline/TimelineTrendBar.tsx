import moment from 'moment';
import React from 'react';
import { IoMdArrowRoundUp as UpArrow, IoMdArrowRoundDown as DownArrow, IoMdArrowRoundForward as RightArrow } from "react-icons/io"
import { BsPersonFill as Person } from "react-icons/bs"
import { TimelineValueSet } from './Timeline';

interface Props {
    color: string;
    comparison?: number;
    isNumeric: boolean;
    values: TimelineValueSet;
}

export default class DynamicTimelineTrendBar extends React.Component<Props> {
    private className = 'dynamic-timeline-trend-bar';

    public render() {
        const { values, color, comparison, isNumeric } = this.props;
        const { ds, data } = values;
        const c = this.className;
    
        if (!data) { return null; }
        const [ val, date ] = this.getLastValue();

        return (
            <div className={c}>
                <div className={`${c}-arrow`} style={{ color }}>
                    {this.getPrimarySymbol()}
                </div>
                <div className={`${c}-text-container`}>
                    {/* Get last value if numeric */}
                    {isNumeric &&
                    <div className={`${c}-last-value`} style={{ color }}>
                        <div>{val}</div>
                    </div>
                    }
                    <div className={`${c}-name-container`}>
                        {/* Numeric */}
                        {isNumeric &&
                        <div>
                            <div className={`${c}-name`}>{ds.title}</div>
                            <div className={`${c}-datediff`}>{this.getDateDiff(date)}</div>
                        </div>
                        }
                        {/* Non-Numeric */}
                        {!isNumeric &&
                        <div>
                            <div className={`${c}-name`}>Latest Social/Health Event</div>
                            <div className={`${c}-name non-numeric-last`} style={{ color }}>{val}</div>
                            <div className={`${c}-datediff`}>{this.getDateDiff(date)}</div>
                        </div>
                        }
                    </div>
                </div>
                {this.isValid(comparison) && 
                <div className={`${c}-diff`}>
                    {this.getComparisonDiff()}
                </div>
                }
            </div>
        );
    }

    private isValid = (val?: number): boolean => {
        if (typeof val === 'undefined') return false;
        if (isNaN(val)) return false;
        return true;
    }

    private getDateDiff = (val: Date): string => {
        const then = moment(val);
        const now = moment(new Date());

        for (const pair of [['year','yr'],['month','mo'],['day','dy']]) {
            let [ unit, abbr ] = pair;
            const diff = now.diff(then, unit as any);
            if (diff >= 1) {
                if (diff > 1) { unit += 's'; }
                return `${diff} ${unit} ago`;
            }
        }
        return '';
    }

    private getLastValue = (): [number | string | null, any] => {
        const { isNumeric } = this.props;
        const { data, cols } = this.props.values;

        if (data.length == 0) { return [ "", null ] }
        const last = data[data.length - 1];

        if (isNumeric && data.length > 0) {
            return [ last[cols.fieldValueNumeric!], last[cols.fieldDate!] ];
        }

        return [ last[cols.fieldValueString!], last[cols.fieldDate!] ];
    }

    private getComparisonDiff = (): JSX.Element => {
        const c = this.className;
        const { comparison } = this.props;
        const { data, cols, ds } = this.props.values;
        let diff = "";

        if (!data.length || !this.isValid(comparison)) { return <div/>; }

        const last = data[data.length-1][cols.fieldValueNumeric!] as any as number;
        diff = Math.round(Math.abs(last - comparison!)).toString();

        if (last < comparison!)  diff = `-${diff}`;
        if (last >= comparison!) diff = `+${diff}`;
        if (last === comparison) diff = 'same';

        return (
            <div>
                <div className={`${c}-comparison-value`}>
                    {Math.round(comparison!)}
                </div>
                <div className={`${c}-comparison-diff`}>
                    <span>(</span>
                    <span className={`${c}-comparison-diff-inner`}>
                        {diff}
                    </span>
                    <span>)</span>
                </div>
            </div>
        )
    }

    private getPrimarySymbol = (): JSX.Element => {
        const { isNumeric } = this.props;
        const { data, cols, ds } = this.props.values;

        if (!data.length) { return <span/>; }

        /* Numeric */
        if (isNumeric) {

            if (data.length <= 2) { 
                return <span/>;
            }
            
            const lastIdx = data.length-1;
            const last = data[lastIdx][cols.fieldValueNumeric!];
            const prev = data[lastIdx-1][cols.fieldValueNumeric!];

            if (!last || !prev) { return <span/>; }
            if (last < prev)   { return <DownArrow />; }
            if (last === prev) { return <RightArrow />; }

            return <UpArrow />;
        }

        /* Non-numeric */
        return <Person/>;
    }
};