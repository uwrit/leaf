/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import ImportState from '../../../models/state/Import';
import { setImportRedcapApiToken, toggleImportRedcapModal, importREDCapProjectData, importMetadataFromREDCap, setImportRedcapConfiguration, setImportRedcapMrnField, setImportClearErrorOrComplete } from '../../../actions/dataImport';
import ApiTokenEntryForm from './Sections/ApiTokenEntryForm';
import MrnFieldEntryForm from './Sections/MrnFieldEntryForm';
import ImportProgress from './Sections/ImportProgress';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';
import './REDCapImportModal.css';
import ImportComplete from './Sections/ImportComplete';

interface Props {
    data: ImportState
    dispatch: any;
    show: boolean;
}

interface State {
    mrnFieldValid: boolean;
}

export default class REDCapImportModal extends React.PureComponent<Props, State> {
    private className = 'import-redcap';

    constructor(props: Props) {
        super(props);
        this.state = {
            mrnFieldValid: false
        };
    }

    public render() {
        const c = this.className;
        const classes = [ c, 'leaf-modal' ];
        const { show, data } = this.props;
        const { isImporting } = data;

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
                {!isImporting &&
                <ModalFooter>
                    {this.getFooterButtons()}
                </ModalFooter>
                }
            </Modal>
        );
    }

    /*
     * Generate component footer buttons
     */
    private getFooterButtons = () => {
        const c = this.className;
        const { data } = this.props;
        const { redCap } = data;
        const { mrnFieldValid } = this.state;
        const buttons: any[] = [];

        if (data.isErrored || data.isComplete) {
            buttons.push(
                <Button key={3} className="leaf-button-primary" onClick={this.handleErrorOrCompleteOkayButtonClick}>
                    <span>Okay</span>
                </Button>
            );
        } else if (!redCap.config) {
            buttons.push(
                <Button key={1} className="leaf-button leaf-button-primary" onClick={this.handleImportButtonClick} disabled={!redCap.apiToken}>
                    <span>Begin Import</span>
                    <FaChevronRight className={`${c}-chevron-right`}/>
                </Button>
            );
        } else if (redCap.config) {
            buttons.push(
                <Button key={2} className="leaf-button leaf-button-secondary" onClick={this.handleEditApiTokenClick}>
                    <FaChevronLeft className={`${c}-chevron-left`}/>
                    <span>Edit API token</span>
                </Button>
            );
            buttons.push(
                <Button key={3} className="leaf-button leaf-button-primary" onClick={this.handleImportButtonClick} disabled={!mrnFieldValid}>
                    <FiCheck className={`${c}-check`}/>
                    <span>Import Project</span>
                </Button>);
        } 
        return buttons;
    }

    /*
     * Generate component for the API token entry (if not yet validated)
     * or else a summary of the loaded REDCap metadata.
     */
    private getMainContent = () => {
        const { dispatch, data } = this.props;
        const { redCap, isImporting, isComplete, isErrored } = data;
        const { mrnFieldValid } = this.state;

        if (isErrored) {
            return <p>Whoops, an error occurred while attempting to import your data. We are sorry for the inconvenience.</p>
        } else if (isComplete) {
            return <ImportComplete data={data} />
        }

        /*
         * Step 1: if no config generated, show API token entry form.
         */
        if (!redCap.config) {
            return <ApiTokenEntryForm redCap={redCap} tokenInputChangeHandler={this.handleTokenInputChange} />;
        /*
         * Step 2: Else if we have a config but not importing yet, show MRN field entry form.
         */
        } else if (redCap.config && !isImporting) {
            return (
                <MrnFieldEntryForm 
                    dispatch={dispatch} mrnFieldInputChangeHandler={this.handleMrnFieldChange} 
                    redCap={redCap} setMrnFieldValid={this.setMrnFieldValid} valid={mrnFieldValid} 
                />
            );
        /*
         * Step 3: Else if importing, show progress body.
         */
        } else if (isImporting) {
            return <ImportProgress data={data} />;
        }
        return null;
    }

    /*
     * Handle clicks to re-edit the API token. This clears the current Import configuration.
     */
    private handleEditApiTokenClick = () => {
        const { dispatch } = this.props;
        dispatch(setImportRedcapConfiguration());
    }

    /*
     * Handle clicks to 'Okay' button after import error or completion.
     */
    private handleErrorOrCompleteOkayButtonClick = () => {
        const { dispatch, data } = this.props;
        dispatch(setImportClearErrorOrComplete());

        if (data.isComplete) {
            dispatch(toggleImportRedcapModal());
        }
    }

    /* 
     * Handle changes to the token input box.
     */
    private handleTokenInputChange = (token: string) => {
        const { dispatch } = this.props;
        dispatch(setImportRedcapApiToken(token));
    }

    /* 
     * Handle changes to the mrn search box.
     */
    private handleMrnFieldChange = (text: string) => {
        const { dispatch } = this.props;
        dispatch(setImportRedcapMrnField(text));
    }

    /* 
     * Set whether the entered MRN field exists.
     */
    private setMrnFieldValid = (mrnFieldValid: boolean) => this.setState({ mrnFieldValid });

    /* 
     * Handle clicks on the 'Import' button.
     */
    private handleImportButtonClick = () => {
        const { dispatch, data } = this.props;

        if (!data.redCap.config) {
            dispatch(importMetadataFromREDCap());
        } else {
            dispatch(importREDCapProjectData());
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