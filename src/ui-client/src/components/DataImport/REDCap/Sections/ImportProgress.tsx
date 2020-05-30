/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import REDCapImportSection from './REDCapImportSection';
import ImportState from '../../../../models/state/Import';
import ProgressBar from '../../../Other/ProgressBar/ProgressBar';
import ImportProgressCounts from './ImportProgressCounts';
import './ImportProgress.css';

interface Props {
    data: ImportState;
}

export default class ImportProgress extends React.PureComponent<Props> {
    private className = 'import-redcap-progress';

    public render() {
        const c = this.className;
        const { data } = this.props;
        const { redCap } = data;
        const { completed, estimatedSecondsRemaining, text } = data.progress;

        return (
            <REDCapImportSection>
                <div className={`${c}-container`}>

                    {/* Project name */}
                    <div className={`${c}-project-name`}>
                        Importing "{redCap.config!.projectInfo.project_title}"...
                    </div>

                    <div className={`${c}-outer`}>
                        <div className={`${c}-inner`}>

                            {/* Stats */}
                            <ImportProgressCounts data={data} />

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
};