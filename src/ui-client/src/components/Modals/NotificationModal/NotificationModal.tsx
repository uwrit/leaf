/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { hideConfirmModal } from '../../../actions/generalUi';
import { AppState, AuthorizationState } from '../../../models/state/AppState';

interface OwnProps {
}
interface DispatchProps {
    dispatch: any;
}
interface StateProps {
    auth?: AuthorizationState;
}

type Props = StateProps & DispatchProps & OwnProps;

export default class NotificationModal extends React.PureComponent<Props> {
    public render() {
        const { confirmationModal } = this.props;
        const buttonClasses = "leaf-button leaf-button";
        const noButtonText = confirmationModal.noButtonText || 'No';
        const yesButtonText = confirmationModal.yesButtonText || 'Yes';
        const backdrop = this.props.backdrop || true;
        const classes = [ 'leaf-modal', 'binary-selection-modal', (this.props.className ? this.props.className : '') ];

        return (
            <Modal isOpen={confirmationModal.show} className={classes.join(' ')} backdrop={backdrop}>
                <ModalHeader>{confirmationModal.header}</ModalHeader>
                <ModalBody>
                    {confirmationModal.body}                    
                </ModalBody>
                <ModalFooter>
                    <Button className={`${buttonClasses}-primary`} onClick={this.handleClickOkay}>{yesButtonText}</Button>
                </ModalFooter>
            </Modal>
        );
    }

    private handleClickOkay = () => {
        const { confirmationModal, dispatch } = this.props;
        dispatch(hideConfirmModal());
    }
}

const mapStateToProps = (state: AppState) => {
    return {
        auth: state.auth
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    };
};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(App);
