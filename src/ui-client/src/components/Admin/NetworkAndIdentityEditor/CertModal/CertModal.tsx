/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Container, Row, Col } from 'reactstrap';
import { Certificate } from '../../../../models/admin/Network';
import { TextArea } from '../../Section/TextArea';

interface Props { 
    data: Certificate;
    onClickNo: () => void;
    onClickYes: () => void;
    show: boolean;
}

export default class InformationModal extends React.PureComponent<Props> {
    private className = 'identity-network-endpoint-certificate-preview';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { show, onClickNo, onClickYes, data } = this.props;
        const c = this.className;

        return (
            <Modal isOpen={show} className={'leaf-modal'} backdrop={true}>
                <ModalHeader>Certificate Information</ModalHeader>
                <ModalBody>
                    <p>
                        The certificate request call to the Leaf endpoint {} returned the below information.
                        Do you wish to load this data?
                    </p>
                    <Container>
                        <Row className={c}>
                            <Col md={6}>
                                <TextArea
                                    changeHandler={this.dummyHandler} propName={'keyId'} value={data.keyId}
                                    label='Key ID' locked={true}
                                />
                            </Col>
                            <Col md={6}>
                                <TextArea
                                    changeHandler={this.dummyHandler} propName={'issuer'} value={data.issuer}
                                    label='Issuer' locked={true}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <TextArea
                                    changeHandler={this.dummyHandler} propName={'certificate'} value={data.data}
                                    label='Certificate' locked={true}
                                />
                            </Col>
                        </Row>
                    </Container>              
                </ModalBody>
                <ModalFooter>
                    <Button className="leaf-button leaf-button-primary" onClick={onClickNo}>Nevermind</Button>
                    <Button className="leaf-button leaf-button-primary" onClick={onClickYes}>Yes, load this certifcate</Button>
                </ModalFooter>
            </Modal>
        );
    }

    private dummyHandler = () => null;
}