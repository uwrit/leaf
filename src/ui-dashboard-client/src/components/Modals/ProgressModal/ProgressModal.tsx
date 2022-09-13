/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Modal, ModalBody } from 'reactstrap';
import { ProgressModalState } from '../../../models/Session';
import './ProgressModal.css';

interface Props { 
    dispatch: any;
    state: ProgressModalState;
}

export default class ProgressModal extends React.Component<Props> {
    private className = 'progress-modal'
    
    public render() {
        const { message, percent, show } = this.props.state;
        const c = this.className;
        const classes = [ 'leaf-modal', c ];

        return (
            <Modal isOpen={show} className={classes.join(' ')} backdrop={true}>
                <ModalBody>
                    <div className={`${c}-content`}>
                        <div className={`${c}-text`}>{message}...</div>
                        <div className={`leaf-progress-bar animate ${c}-bar`} style={{ width: `${percent * 100}%` }}></div>
                    </div>                
                </ModalBody>
            </Modal>
        );
    }
}