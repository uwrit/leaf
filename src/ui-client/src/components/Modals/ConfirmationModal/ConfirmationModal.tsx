/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { hideConfirmModal } from '../../../actions/generalUi';

interface Props { 
    backdrop?: boolean;
    className?: string;
    dispatch: any;
    confirmationModal: ConfirmationModalState;
}

export default class ConfirmationModal extends React.PureComponent<Props> {
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
                    <Button className={`${buttonClasses}-secondary mr-auto`} onClick={this.handleClickCancel}>Cancel</Button>
                    <Button className={`${buttonClasses}-secondary`} onClick={this.handleClickNo}>{noButtonText}</Button>
                    <Button className={`${buttonClasses}-primary`} onClick={this.handleClickYes}>{yesButtonText}</Button>
                </ModalFooter>
            </Modal>
        );
    }

    private handleClickCancel = () => {
        const { dispatch } = this.props;
        dispatch(hideConfirmModal());
    }

    private handleClickNo = () => {
        const { confirmationModal, dispatch } = this.props;
        confirmationModal.onClickNo();
        dispatch(hideConfirmModal());
    }

    private handleClickYes = () => {
        const { confirmationModal, dispatch } = this.props;
        confirmationModal.onClickYes();
        dispatch(hideConfirmModal());
    }
}