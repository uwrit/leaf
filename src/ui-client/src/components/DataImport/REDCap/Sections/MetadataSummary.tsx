/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { REDCapImportState } from '../../../../models/state/Import';

interface Props {
    redCap: REDCapImportState;
}

export default class MetadataSummary extends React.PureComponent<Props> {
    private className = 'import-redcap-metadata-summary';

    public render() {
        const c = this.className;
        const contClass = `${c}-container`;
        const fieldClass = `${c}-field`;
        const valueClass = `${c}-value`;
        const { redCap } = this.props;
        const { projectInfo, metadata } = redCap.config!;

        return (
            <div className={c}>
                
                {/* Project Title */}
                <div className={contClass}>
                    <div className={fieldClass}>Project Title</div>
                    <div className={valueClass}>{projectInfo.project_title}</div>
                </div>

                {/* Fields */}
                <div className={contClass}>
                    <div className={fieldClass}>Total Fields</div>
                    <div className={valueClass}>{metadata.length.toLocaleString()}</div>
                </div>

                {/* API Token */}
                <div className={contClass}>
                    <div className={fieldClass}>API Token</div>
                    <div className={valueClass}>{redCap.apiToken}</div>
                </div>

            </div>
        )
    }
};