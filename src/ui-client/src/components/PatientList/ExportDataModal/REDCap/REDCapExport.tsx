/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, FormGroup, Input } from 'reactstrap';
import { exportToREDCap } from '../../../../actions/dataExport';
import ExportState from '../../../../models/state/Export';
import ExportProgress from '../ExportProgress/ExportProgress';
import './REDCapExport.css';

interface Props {
    className?: string;
    exportState: ExportState;
    handleClickClearErrorOrComplete: () => void;
    registerClickExportHandler: (f: any) => void;
}

interface State {
    projectNameError: boolean;
    projectName: string;
}

export default class REDCapExport extends React.PureComponent<Props,State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            projectNameError: false,
            projectName: ''
        }
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
        let inputPlaceholder = 'REDCap Project name....';

        if (this.state.projectNameError) {
            inputClasses.push('error');
            inputPlaceholder = 'Enter a Project name...';
        }

        return  (
            <div className={`${c}-container`}>
            {!isExporting &&
                <div className={`${c}-description`}>
                    <p>
                        The REDCap Project Creation tool allows you to create a brand-new REDCap Project based on the data in your Patient List. 
                        Leaf will export all of your datasets and patient data, and only you will have access to the new Project.
                    </p>
                    <p>
                        Your project will export to <a href={redcapInstanceUrl} target="_blank">{redcapInstanceUrl}</a>
                    </p>
                    <FormGroup>
                        <Input 
                            className={inputClasses.join(' ')}
                            type="text" 
                            id={`${c}-projectname`} 
                            onChange={this.handleREDCapProjectNameChange} 
                            placeholder={inputPlaceholder}
                            spellCheck={false}
                            value={this.state.projectName} />
                    </FormGroup>
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
                        <ExportProgress exportState={exportState}/>
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
            return <p>All done! Your new project can be found at <a href={redCap.url} target="_blank">{redCap.url}</a></p>;
        }
        return <span>{progress.text}...</span>;
    }

    private handleREDCapProjectNameChange = (e: any) => {
        const projectName = e.currentTarget.value;
        this.setState({ projectNameError: false, projectName });
    }

    private handleClickExport = (): any => {
        const projName = this.state.projectName;
        if (projName) {
            return () => exportToREDCap(projName);
        }
        else {
            this.setState({ projectNameError: true });
        }
    }
}