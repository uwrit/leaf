/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button } from 'reactstrap';
import { exportToCSV } from '../../../../../actions/dataExport';
import ExportState from '../../../../../models/state/Export';
import ProgressBar from '../../../../Other/ProgressBar/ProgressBar';
import './CSVExport.css';

interface Props {
    className?: string;
    exportState: ExportState;
    handleClickClearErrorOrComplete: () => void;
    registerClickExportHandler: (f: any) => void;
}

export default class CSVExport extends React.PureComponent<Props> {

    public componentDidMount () {
        this.props.registerClickExportHandler(this.handleClickExport);
    }

    public render() {
        const { className, exportState } = this.props;
        const { isComplete, isErrored, isExporting } = exportState;
        const c = className ? className : 'patientlist-export-modal-csv';
        const { completed } = exportState.progress;

        return  (
            <div className={`${c}-container`}>
            {!isExporting &&
                <div className={`${c}-description`}>
                    <p>
                        Download your current Patient List data as CSV spreadsheet files! 
                        Leaf will generate a separate file for each of your Patient List datasets.
                    </p>

                    {/* Example table */}
                    <div className={`${c}-subtext`}>Example:</div>
                    <table className={`${c}-example-table`}>
                        <thead>
                            <tr>
                                <th>personId</th>
                                <th>age</th>
                                <th>gender</th>
                                <th>language</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>123</td>
                                <td>22</td>
                                <td>Female</td>
                                <td>English</td>
                            </tr>
                            <tr>
                                <td>456</td>
                                <td>65</td>
                                <td>Male</td>
                                <td>Spanish</td>
                            </tr>
                            <tr>
                                <td>789</td>
                                <td>9</td>
                                <td>Female</td>
                                <td>English</td>
                            </tr>
                        </tbody>
                    </table>
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
                        <ProgressBar percentCompleted={completed} />
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
            return <p>All done! Your CSV files have been successfully downloaded.</p>;
        }
        return <span>{progress.text}...</span>;
    }

    private handleClickExport = (): any => {
        return () => exportToCSV();
    }
}