/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ExportState from '../../../../models/state/Export';
import './ExportProgress.css';

interface Props {
    className?: string;
    exportState: ExportState
}

export default class ExportProgress extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { className, exportState } = this.props;
        const { progress } = exportState;
        const c = className ? className : 'patientlist-export-modal-progress';

        return  (
            <div className={`${c}-container`}>
                <div className={`${c}-progressbar-outer`}>
                    <div className={`leaf-progressbar show relative`} style={{ width: `${progress.completed}%` }} />
                </div>
                <div className={`${c}-remaining`}>
                    <span>{this.getRemainingTimeText(progress.estimatedSecondsRemaining)}</span>
                </div>
            </div>
        );
    }

    private getRemainingTimeText = (estimatedSeconds?: number): string => {
        if (!estimatedSeconds) { return ''; }
        if (estimatedSeconds === 0) { return 'almost done'; }

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