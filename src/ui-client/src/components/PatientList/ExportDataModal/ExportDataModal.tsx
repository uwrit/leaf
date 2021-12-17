/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { setExportClearErrorOrComplete } from '../../../actions/dataExport';
import ExportState from '../../../models/state/Export';
import REDCapExport from './REDCap/REDCapExport';
import CSVExport from './CSV/CSVExport';
import './ExportDataModal.css';

interface Props { 
    dispatch: any;
    show: boolean;
    exportState: ExportState
    toggle: () => any;
    rowCount: number;
}

interface State {
    selected: string;
}

const opts = {
    csv: 'csv',
    redcap: 'redcap'
};

export default class ExportDataModal extends React.PureComponent<Props, State> {
    private clickExportHandler: any;
    
    constructor(props: Props) {
        super(props);
        this.state = {
            selected: props.exportState.redCap.enabled ? opts.redcap : props.exportState.csv.enabled ? opts.csv : ''
        }
    }

    public render() {
        const c = 'patientlist-export-modal';
        const { exportState, rowCount, show } = this.props;
        const { selected } = this.state;
        const { enabled, csv, redCap, isExporting } = exportState;
        const modalClasses = [ c, 'leaf-modal', (isExporting ? 'exporting' : '') ];
        const anyEnabled = !!csv || !!redCap;
        const redcapSelected = selected === opts.redcap;
        const csvSelected = selected === opts.csv;

        return (
            <Modal isOpen={show} className={modalClasses.join(' ')} backdrop={true} size="lg">
                <ModalHeader>Export Data</ModalHeader>
                <ModalBody>
                    {enabled &&
                    <Row>
                        <Col className={`${c}-options`} md={3}>
                            {redCap.enabled &&
                            <div className={`${c}-option ${redcapSelected ? 'selected' : ''}`} onClick={this.handleExportOptionClick.bind(null, opts.redcap)}>
                                <img alt='redcap-logo' className={`${c}-option-logo`} src={`${process.env.PUBLIC_URL}/images/logos/apps/redcap.png`}/>
                                <span>REDCap</span>
                            </div>
                            }
                            {csv.enabled &&
                            <div className={`${c}-option ${csvSelected ? 'selected' : ''}`} onClick={this.handleExportOptionClick.bind(null, opts.csv)}>
                                <img alt='csv-logo' className={`${c}-option-logo`} src={`${process.env.PUBLIC_URL}/images/logos/apps/csv.png`}/>
                                <span>CSV</span>
                            </div>
                            }
                        </Col>
                        <Col className={`${c}-selected-option`} md={9}>
                            {redcapSelected && 
                            <REDCapExport 
                                exportState={exportState} 
                                handleClickClearErrorOrComplete={this.handleClickClearErrorOrComplete} 
                                registerClickExportHandler={this.setClickExportHandler}
                                rowCount={rowCount}
                            />
                            }
                            {csvSelected && 
                            <CSVExport
                                exportState={exportState} 
                                handleClickClearErrorOrComplete={this.handleClickClearErrorOrComplete} 
                                registerClickExportHandler={this.setClickExportHandler}
                            />
                            }
                        </Col>
                    </Row>
                    }
                    {!anyEnabled &&
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

    private handleExportOptionClick = (selected: string) => {
        const { exportState } = this.props;
        const { isErrored, isExporting } = exportState;

        if (isExporting || isErrored) { return; }
        this.setState({ selected });
    }

    private handleClickClearErrorOrComplete = () => {
        const { dispatch, toggle, exportState } = this.props;
        const { isComplete, isErrored } = exportState;

        if (isErrored) {
            dispatch(setExportClearErrorOrComplete());
        } else if (isComplete) {
            dispatch(toggle());
            setTimeout(() => dispatch(setExportClearErrorOrComplete()), 2000);
        }
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