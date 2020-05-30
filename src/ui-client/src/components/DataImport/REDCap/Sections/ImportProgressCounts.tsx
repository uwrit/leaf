/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import CountUp from 'react-countup';
import ImportState from '../../../../models/state/Import';

interface Props {
    data: ImportState;
}

export default class ImportProgressCounts extends React.Component<Props> {
    private className = 'import-redcap-progress';
    private prevCountPats = 0;
    private prevCountRows = 0;

    public componentDidUpdate(props: Props, state: any, vals: number[]) {
        const [ rows, patients ] = vals;

        if (rows !== this.prevCountRows) {
            this.prevCountRows = rows;
        }
        if (patients !== this.prevCountPats) {
            this.prevCountPats = patients;
        }
    }

    public getSnapshotBeforeUpdate() {
        const { rows, patients } = this.props.data.redCap;
        return [ rows, patients ];
    }

    public shouldComponentUpdate(nextProps: Props, nextState: any) {

        if (nextProps.data.redCap.rows !== this.prevCountRows) {
            return true;
        }
        if (nextProps.data.redCap.patients !== this.prevCountPats) {
            return true;
        }
        return false;
    }

    public render() {
        const c = this.className;
        const { data } = this.props;
        const { redCap } = data;
        const duration = 1.0;

        return (
            <div className={`${c}-counts`}><div className={`${c}-count`}>
                <CountUp className={`${c}-count-value`}
                        start={this.prevCountRows} 
                        end={redCap.rows} 
                        duration={duration} 
                        decimals={0} 
                        formattingFn={this.formatNumber}
                    />
                    <div className={`${c}-count-text`}>TOTAL ROWS</div>
                </div>
                <div className={`${c}-count`}>
                    <CountUp className={`${c}-count-value`}
                        start={this.prevCountPats} 
                        end={redCap.patients} 
                        duration={duration} 
                        decimals={0} 
                        formattingFn={this.formatNumber} 
                    />
                    <div className={`${c}-count-text`}>TOTAL PATIENTS</div>
                </div>
            </div>
        );
    }

    /*
     * Format a number with commas.
     */
    private formatNumber = (n: number) => n.toLocaleString();
};