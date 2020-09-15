/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, FormGroup, Input } from 'reactstrap';
import { exportToREDCap } from '../../../../actions/dataExport';
import ExportState from '../../../../models/state/Export';
import { formatSmallNumber } from '../../../../utils/formatNumber';
import ProgressBar from '../../../Other/ProgressBar/ProgressBar';

interface Props {
    className?: string;
    exportState: ExportState;
    handleClickClearErrorOrComplete: () => void;
    registerClickExportHandler: (f: any) => void;
}

export default class CSVExport extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public componentDidMount () {
        this.props.registerClickExportHandler(this.handleClickExport);
    }

    public render() {
        const { className, exportState } = this.props;
        const { isComplete, isErrored, isExporting, redCap } = exportState;
        const c = className ? className : 'patientlist-export-modal-redcap';
        const inputClasses = [ 'leaf-input' ];
        const redcapInstanceUrl = redCap.apiURI ? redCap.apiURI!.replace('/api/','') : '';
        const formattedRowLimit = formatSmallNumber(redCap.rowLimit!);
        const { completed, estimatedSecondsRemaining } = exportState.progress;

        return  (
            <div className={`${c}-container`}>
            {!isExporting &&
                <div className={`${c}-description`}>
                    <p>
                        The REDCap Project Creation tool allows you to create a brand-new REDCap Project based on the data in your Patient List. 
                        Leaf will export all of your datasets and patient data, and only you will have access to the new Project.
                    </p>
                </div>
            }
            {isExporting &&
            <div className={`${c}-exporting-container`}>
                <div className={`${c}-exporting-outer`}>
                    <div className={`${c}-exporting-inner`}>
                        <div className={`${c}-text`}>
                            {this.getDisplay(exportState)}
                        </div>
                        {!isErrored && 
                        <ProgressBar percentCompleted={completed} secondsRemaining={estimatedSecondsRemaining} />
                        }
                    </div>
                </div>
            </div>
            }
            {(isComplete || isErrored) && 
            <Button className="leaf-button leaf-button-primary" style={{ float: 'right' }} onClick={this.props.handleClickClearErrorOrComplete}>Okay</Button>
            }
        </div>
        );
    }

    private getDisplay = (exportState: ExportState) => {
        const { isComplete, isErrored, progress, redCap } = exportState;

        if (isErrored) {
            return <p>Uh oh, it looks like something went wrong while exporting. We apologize for the inconvenience.</p>;
        }
        if (isComplete) {
            return <p>All done! Your new project can be found at <a href={redCap.url} target="_blank" rel='noopener noreferrer'>{redCap.url}</a></p>;
        }
        return <span>{progress.text}...</span>;
    }

    private handleClickExport = (): any => {
        if (1+1 === 4) {
            this.setState({ projectName: '' });
            return () => exportToREDCap('');
        }
        else {
            this.setState({ projectNameError: true });
        }
    }
}