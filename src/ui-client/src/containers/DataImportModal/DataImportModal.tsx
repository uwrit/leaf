/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Input } from 'reactstrap';
import { Dispatch } from 'redux';
import { AppState } from '../../models/state/AppState';
import ImportState from '../../models/state/Import';
import { importFromREDCap, toggleImportRedcapModal } from '../../actions/dataImport';
import './DataImportModal.css';

interface StateProps {
    dataImport: ImportState;
    show: boolean;
}
interface DispatchProps {
    dispatch: Dispatch<any>
}
interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
    token: string;
}

class DataImportModal extends React.PureComponent<Props,State> {
    private className = 'data-import-modal';

    public constructor(props: Props) {
        super(props);
        this.state = {
            token: ''
        }
    }

    public render() {
        const c = this.className;
        const classes = [ c, 'leaf-modal' ];
        const { show } = this.props;
        const { token } = this.state;

        return (
            <Modal isOpen={show} className={classes.join(' ')} keyboard={true}>
                <ModalHeader>
                    REDCap Import
                    <span className={`${c}-close`} onClick={this.handleCloseClick}>✖</span>
                </ModalHeader>
                <ModalBody>
                    <Input value={token} onChange={this.handleTokenInputChange} />
                </ModalBody>
                <ModalFooter>
                    <Button className="leaf-button leaf-button-primary" onClick={this.handleImportButtonClick}>Import</Button>
                </ModalFooter>
            </Modal>
        );
    }

    /* 
     * Handle changes to the token input box.
     */
    private handleTokenInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({ token: e.currentTarget.value });
    }

    /* 
     * Handle clicks on the 'Import' button.
     */
    private handleImportButtonClick = () => {
        const { dispatch } = this.props;
        const { token } = this.state;
        dispatch(importFromREDCap(token));
    }

    /* 
     * Handle 'close' button clicks.
     */
    private handleCloseClick = () => {
        const { dispatch } = this.props;
        dispatch(toggleImportRedcapModal());
    }
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        dataImport: state.dataImport,
        show: state.generalUi.showImportRedcapModal
    };
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DataImportModal);