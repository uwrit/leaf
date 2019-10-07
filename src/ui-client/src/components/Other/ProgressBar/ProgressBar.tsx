/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './ProgressBar.css';

interface Props {
    percentCompleted: number;
    secondsRemaining?: number;
}

export default class ProgressBar extends React.PureComponent<Props> {
    private className = 'progressbar';

    public render() {
        const c = this.className;
        const { percentCompleted, secondsRemaining } = this.props;

        return  (
            <div className={`${c}-container`}>
                <div className={`${c}-outer`}>
                    <div className={`leaf-progressbar show relative`} style={{ width: `${percentCompleted}%` }} />
                </div>
                <div className={`${c}-remaining`}>
                    <span>{this.getRemainingTimeText(secondsRemaining)}</span>
                </div>
            </div>
        );
    }

    private getRemainingTimeText = (estimatedSeconds?: number): string => {
        if (!estimatedSeconds) { return ''; }
        if (estimatedSeconds <= 0) { return 'almost done'; }

        let num = estimatedSeconds;
        let unit = 'second';
        if (estimatedSeconds >= 3600) {
            num = Math.floor(estimatedSeconds / 3600);
            unit = 'hour';
        }
        if (estimatedSeconds >= 60) {
            num = Math.floor(estimatedSeconds / 60);
            unit = 'minute';
        }
        return `about ${num} ${unit}${num === 1 ? '' : 's'} remaining`;
    }
}