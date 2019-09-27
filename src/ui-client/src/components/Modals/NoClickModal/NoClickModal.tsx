/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Modal, ModalBody, Row, Col } from 'reactstrap';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon';
import { FiCheckCircle } from 'react-icons/fi';
import { setNoClickModalState } from '../../../actions/generalUi';
import './NoClickModal.css';
import { NoClickModalState, NotificationStates } from '../../../models/state/GeneralUiState';

interface Props { 
    dispatch: any;
    state: NoClickModalState;
}

export default class NoClickModal extends React.Component<Props> {
    private hideTimeoutOnCompleteMs = 1500;
    
    public componentDidUpdate(prevProps: Props) {
        const currState = this.props.state;
        const { dispatch } = this.props;

        if (currState.state === NotificationStates.Complete) {
            const noclickState: NoClickModalState = {
                ...currState,
                state: NotificationStates.Hidden
            }

            // Auto-hide the modal after timeout
            setTimeout(() => dispatch(setNoClickModalState(noclickState)), this.hideTimeoutOnCompleteMs);
        }
    }

    public render() {
        const { state } = this.props;
        const classes = [ 'leaf-modal', 'noclick-modal', (state.state === NotificationStates.Complete ? 'complete' : '') ];

        return (
            <Modal isOpen={state.state !== NotificationStates.Hidden} className={classes.join(' ')}>
                <ModalBody>
                    {this.getModalBody()}                    
                </ModalBody>
            </Modal>
        );
    }

    private getModalBody = () => {
        const { state } = this.props;

        switch (state.state) {
            case NotificationStates.Working:
                return (
                    <Row>
                        <Col md={4}><LoaderIcon size={100} /></Col>
                        <Col md={8}>
                            <div className="noclick-modal-text noclick-modal-text-calling">{state.message}...</div>
                        </Col>
                    </Row>
                );
            case NotificationStates.Complete:
                return (
                    <Row>
                        <Col md={4}><FiCheckCircle/></Col>
                        <Col md={8}>
                            <div className="noclick-modal-text noclick-modal-text-complete">{state.message}</div>
                        </Col>
                    </Row>
                );
            default:
                return null;
        }
    }
}