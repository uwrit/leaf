/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { setExportClearErrorOrComplete } from '../../../actions/dataExport';
import ExportState from '../../../models/state/Export';
import './ExportDataModal.css';
import REDCapExport from './REDCap/REDCapExport';

interface Props { 
    dispatch: any;
    show: boolean;
    exportState: ExportState
    toggle: () => any;
}

interface State {
    selected: string;
}

export default class ExportDataModal extends React.PureComponent<Props, State> {
    private clickExportHandler: any;
    
    constructor(props: Props) {
        super(props);
        this.state = {
            selected: 'REDCap'
        }
    }

    public render() {
        const c = 'patientlist-export-modal';
        const { redCap, isExporting } = this.props.exportState;
        const hasExportOptions = redCap.enabled;
        const modalClasses = [ c, 'leaf-modal', (isExporting ? 'exporting' : '') ];

        return (
            <Modal isOpen={this.props.show} className={modalClasses.join(' ')} backdrop={true} size="lg">
                <ModalHeader>Export Data</ModalHeader>
                <ModalBody>
                    {hasExportOptions &&
                    <Row>
                        <Col className={`${c}-options`} md={3}>
                            <div className={`${c}-option selected`}>
                                <img className={`${c}-option-logo`} src={`${process.env.PUBLIC_URL}/images/logos/apps/redcap.png`}/>
                                <span>REDCap</span>
                            </div>
                        </Col>
                        <Col className={`${c}-selected-option`} md={9}>
                            <REDCapExport 
                                exportState={this.props.exportState} 
                                handleClickClearErrorOrComplete={this.handleClickClearErrorOrComplete} 
                                registerClickExportHandler={this.setClickExportHandler}
                            />
                        </Col>
                    </Row>
                    }
                    {!hasExportOptions &&
                    <div className={`${c}-no-options`}>
                        <p>
                            Whoops! It doesn't look like you have any export options configured. 
                            Please talk to your Leaf administrator if you believe this to be a mistake.
                        </p>
                    </div>
                    }
                </ModalBody>
                <ModalFooter>
                    <Button className="leaf-button leaf-button-secondary mr-auto" onClick={this.handleClickClose}>Close</Button>
                    <Button className="leaf-button leaf-button-primary" onClick={this.handleClickExport}>Export</Button>
                </ModalFooter>
            </Modal>
        );
    }

    private handleClickClearErrorOrComplete = () => {
        this.props.dispatch(setExportClearErrorOrComplete());
    }

    private handleClickClose = () => {
        if (this.props.exportState.isExporting) { return; }
        this.props.dispatch(this.props.toggle())
    }

    private setClickExportHandler = (f: any) => {
        if (f) {
            this.clickExportHandler = f;
        }
    }

    private handleClickExport = () => {
        if (this.props.exportState.isExporting) { return; }

        /*
         * Each export module registers a clickExportHandler()
         * on componentDidMount(), and this ExportDataModal tracks only the current
         * handler. The handler is called here. If a function is
         * returned that means it is ready to export, so the handler return 
         * function is called and sent to Redux dispatch().
         */
        if (this.clickExportHandler) {
            const f = this.clickExportHandler();
            if (f) {
                this.props.dispatch(f());
            }
        }
    }
}