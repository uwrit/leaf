/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { NetworkEndpoint } from '../../../../models/admin/Network';
import { TextArea } from '../../Section/TextArea';
import { AdminNetworkCertificateModalState } from '../../../../models/state/AdminState';
import { setAdminNetworkCertModalShown, setAdminNetworkEndpoint } from '../../../../actions/admin/networkAndIdentity';

interface Props { 
    data: AdminNetworkCertificateModalState;
    dispatch: any;
}

export default class CertModal extends React.PureComponent<Props> {
    private className = 'identity-network-endpoint-certificate-preview';

    public render() {
        const { data } = this.props;
        const c = this.className;

        return (
            <Modal isOpen={data.show} className={`leaf-modal ${c}`} backdrop={true} size={'lg'}>
                <ModalHeader>Certificate Information</ModalHeader>
                <ModalBody>
                    {data.endpoint &&
                    <p>
                        The certificate request call to the Leaf endpoint "{data.endpoint.address}" returned the below information.
                        Do you wish to load this data?
                    </p>
                    }
                    {data.cert &&
                    <div>
                        <div>
                            <TextArea
                                changeHandler={this.dummyHandler} propName={'keyId'} value={data.cert.keyId}
                                label='Key ID' locked={true}
                            />
                        </div>
                        <div>
                            <TextArea
                                changeHandler={this.dummyHandler} propName={'issuer'} value={data.cert.issuer}
                                label='Issuer' locked={true}
                            />
                        </div>
                        <div>
                            <TextArea
                                changeHandler={this.dummyHandler} propName={'certificate'} value={data.cert.data}
                                label='Certificate' locked={true}
                            />
                        </div>
                    </div>
                    }
                </ModalBody>
                <ModalFooter>
                    <Button className="leaf-button leaf-button-secondary" onClick={this.onClickNo}>Nevermind</Button>
                    <Button className="leaf-button leaf-button-primary" onClick={this.onClickYes}>Yes, load this certifcate</Button>
                </ModalFooter>
            </Modal>
        );
    }

    private dummyHandler = () => null;

    private onClickNo = () => {
        const { dispatch } = this.props;
        dispatch(setAdminNetworkCertModalShown(false));
    };

    private onClickYes = () => {
        const { dispatch, data } = this.props;
        const newEndpoint: NetworkEndpoint = Object.assign({}, data.endpoint, { 
            keyId: data.cert!.keyId,
            issuer: data.cert!.issuer,
            certificate: data.cert!.data
        });
        dispatch(setAdminNetworkEndpoint(newEndpoint, true));
        dispatch(setAdminNetworkCertModalShown(false));
    };
}