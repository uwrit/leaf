/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Input, FormGroup, Label } from 'reactstrap';
import ImportState from '../../../models/state/Import';
import { setImportRedcapApiToken, toggleImportRedcapModal, importRecordsFromREDCap, importMetadataFromREDCap, setImportRedcapConfiguration, setImportRedcapMrnField } from '../../../actions/dataImport';
import './REDCapImportModal.css';
import { loadREDCapImportData } from '../../../services/dataImport';
import MetadataSummary from './MetadataSummary';
import { ReactComponentLike } from 'prop-types';
import MrnFieldSearchBox from './MrnFieldSearchBox';
import ProgressBar from '../../Other/ProgressBar/ProgressBar';
import CountUp from 'react-countup';

interface Props {
    data: ImportState
    dispatch: any;
    show: boolean;
}

export default class REDCapImportModal extends React.PureComponent<Props> {
    private className = 'import-redcap';

    public render() {
        const c = this.className;
        const classes = [ c, 'leaf-modal' ];
        const { show, data, dispatch } = this.props;
        const { redCap, isComplete, isErrored, isImporting } = data;

        return (
            <Modal isOpen={show} className={classes.join(' ')} keyboard={true}>

                {/* Header */}
                <ModalHeader>
                    REDCap Import
                    <span className={`${c}-close`} onClick={this.handleCloseClick}>✖</span>
                </ModalHeader>

                {/* Body */}
                <ModalBody>
                    <div className={`${c}-container`}>
                        {this.getMainContent()}
                    </div>
                </ModalBody>

                {/* Footer */}
                <ModalFooter>
                    {this.getFooterButtons()}
                </ModalFooter>
            </Modal>
        );
    }

    /*
     * Generate component footer buttons
     */
    private getFooterButtons = () => {
        const { redCap } = this.props.data;
        const buttons: any[] = [];
        let mainText = 'Begin Project';

        if (redCap.config) {
            mainText = 'Import Project';
            buttons.push(<Button key={1} className="leaf-button leaf-button-secondary" onClick={this.handleEditApiTokenClick}>Edit API token</Button>);
        }
        buttons.push(<Button key={2} className="leaf-button leaf-button-primary" onClick={this.handleImportButtonClick}>{mainText}</Button>);
        return buttons;
    }

    /*
     * Generate component for the API token entry (if not yet validated)
     * or else a summary of the loaded REDCap metadata.
     */
    private getMainContent = () => {
        const c = this.className;
        const { dispatch, data } = this.props;
        const { redCap, isImporting } = data;
        const { completed, estimatedSecondsRemaining } = data.progress;

        /*
         * Step 1: if no config generated, show API token entry form.
         */
        if (!redCap.config) {
            return (
                <div>
                    <p>
                        The Leaf REDCap Project Import tool allows you to copy project data directly from REDCap into Leaf, tying patient data in REDCap 
                        to data for the same patients data available in Leaf. Start by entering your REDCap Project API Token.
                    </p>
                    <p>
                        <strong>Your REDCap data will only be visible to you and other users already able to access the Project.</strong>
                    </p>
                    <div className={`${c}-input ${c}-api-token-container`}>
                        <FormGroup>
                            <Label>REDCap API Token</Label>
                            <Input
                                className='leaf-input'
                                type="text" 
                                onChange={this.handleTokenInputChange} 
                                placeholder={'Enter token...'}
                                spellCheck={false}
                                readOnly={!!redCap.config}
                                value={redCap.apiToken} />
                        </FormGroup>
                    </div>
                </div>
            )
        /*
         * Step 2: Else if we have a config but not importing yet, show MRN field entry form.
         */
        } else if (redCap.config && !isImporting) {
            return (
                <div>
                    <MetadataSummary redCap={redCap} />
                    <MrnFieldSearchBox redCap={redCap} dispatch={dispatch} mrnFieldChangeHandler={this.handleMrnFieldChange} />
                </div>
            );

        /*
         * Step 3: Else if importing, show progress body.
         */
        } else if (isImporting) {
            return (
                <div className={`${c}-progress-container`}>
                    <div className={`${c}-progress-outer`}>
                        <div className={`${c}-progress-inner`}>
                            <div className={`${c}-counts`}>
                                <div className={`${c}-count-rows`}>
                                    <CountUp className="progress-rowcount" 
                                        start={0} 
                                        end={redCap.rows} 
                                        duration={0.5} 
                                        decimals={0} 
                                        formattingFn={this.formatNumber} 
                                    />
                                </div>
                                <div className={`${c}-count-patients`}>
                                    <CountUp className="progress-patientcount" 
                                        start={0} 
                                        end={redCap.patients} 
                                        duration={0.5} 
                                        decimals={0} 
                                        formattingFn={this.formatNumber} 
                                    />
                                </div>
                            </div>
                            <ProgressBar percentCompleted={completed} secondsRemaining={estimatedSecondsRemaining} />
                        </div>
                    </div>
                </div>
            )
        /*
         * Else we're in error, so show error body.
         */
        } else {
            return <div />
        }
    }

    /*
     * Format a number with commas.
     */
    private formatNumber = (n: number) => n.toLocaleString();

    /*
     * Handle clicks to re-edit the API token. This clears the current Import configuration.
     */
    private handleEditApiTokenClick = () => {
        const { dispatch } = this.props;
        dispatch(setImportRedcapConfiguration(undefined));
    }

    /* 
     * Handle changes to the token input box.
     */
    private handleTokenInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { dispatch } = this.props;
        dispatch(setImportRedcapApiToken(e.currentTarget.value));
    }

    /* 
     * Handle changes to the mrn search box.
     */
    private handleMrnFieldChange = (text: string) => {
        const { dispatch } = this.props;
        dispatch(setImportRedcapMrnField(text));
    }

    /* 
     * Handle clicks on the 'Import' button.
     */
    private handleImportButtonClick = () => {
        const { dispatch, data } = this.props;

        if (!data.redCap.config) {
            dispatch(importMetadataFromREDCap());
        } else {
            dispatch(importRecordsFromREDCap());
        }
    }

    /* 
     * Handle 'close' button clicks.
     */
    private handleCloseClick = () => {
        const { dispatch } = this.props;
        dispatch(toggleImportRedcapModal());
    }
};