/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { hideInfoModal } from '../../../actions/generalUi';
import { InformationModalState } from '../../../models/state/GeneralUiState';

interface Props { 
    backdrop?: boolean;
    className?: string;
    dispatch: any;
    informationModal: InformationModalState;
}

export default class InformationModal extends React.PureComponent<Props> {
    public render() {
        const { informationModal } = this.props;
        const backdrop = this.props.backdrop || true;
        const classes = [ 'leaf-modal', 'information-modal', (this.props.className ? this.props.className : '') ];

        return (
            <Modal isOpen={informationModal.show} className={classes.join(' ')} backdrop={backdrop}>
                <ModalHeader>{informationModal.header}</ModalHeader>
                <ModalBody>
                    {informationModal.body}                    
                </ModalBody>
                <ModalFooter>
                    <Button className="leaf-button leaf-button-primary" onClick={this.handleClickOkay}>Okay</Button>
                </ModalFooter>
            </Modal>
        );
    }

    private handleClickOkay = () => {
        const { dispatch, informationModal } = this.props;
        if (informationModal.onClickOkay) {
            informationModal.onClickOkay();
        }
        dispatch(hideInfoModal());
    }
}