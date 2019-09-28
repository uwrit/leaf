/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import REDCapImportSection from './REDCapImportSection';
import ImportState from '../../../../models/state/Import';
import CountUp from 'react-countup';
import ProgressBar from '../../../Other/ProgressBar/ProgressBar';
import './ImportProgress.css';

interface Props {
    data: ImportState;
}

export default class ImportProgress extends React.PureComponent<Props> {
    private className = 'import-redcap-progress';
    private prevCountPats = 0;
    private prevCountRows = 0;

    public componentDidUpdate(props: Props, state: any, vals: number[]) {
        const [ rows, patients ] = vals;
        this.prevCountRows = rows;
        this.prevCountPats = patients;
    }

    public getSnapshotBeforeUpdate() {
        const { rows, patients } = this.props.data.redCap;
        return [ rows, patients ];
    }

    public render() {
        const c = this.className;
        const { data } = this.props;
        const { redCap } = data;
        const { completed, estimatedSecondsRemaining, text } = data.progress;
        const duration = 1.0;

        return (
            <REDCapImportSection>
                <div className={`${c}-container`}>

                    {/* Project name */}
                    <div className={`${c}-project-name`}>
                        Importing "{redCap.config!.projectInfo.project_title}"...
                    </div>

                    <div className={`${c}-outer`}>
                        <div className={`${c}-inner`}>
                            <div className={`${c}-counts`}>

                                {/* Rows imported */}
                                <div className={`${c}-count`}>
                                    <CountUp className={`${c}-count-value`}
                                        start={this.prevCountRows} 
                                        end={redCap.rows} 
                                        duration={duration} 
                                        decimals={0} 
                                        formattingFn={this.formatNumber}
                                    />
                                    <div className={`${c}-count-text`}>TOTAL ROWS</div>
                                </div>

                                {/* Unique patients imported */}
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

                            {/* Current state text */}
                            <div className={`${c}-text`}>{text}...</div>

                            {/* Percent Complete */}
                            <ProgressBar percentCompleted={completed} secondsRemaining={estimatedSecondsRemaining} />
                        </div>
                    </div>
                </div>
            </REDCapImportSection>
        );
    }

    /*
     * Format a number with commas.
     */
    private formatNumber = (n: number) => n.toLocaleString();
};