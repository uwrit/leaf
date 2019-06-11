/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { NetworkEndpoint } from '../../../models/admin/Network';
import { TextArea } from '../Section/TextArea';
import { setAdminNetworkEndpoint } from '../../../actions/admin/networkAndIdentity';
import { Checkbox } from '../Section/Checkbox';

interface Props {
    endpoint: NetworkEndpoint;
    dispatch: any;
}

interface State {
}

export class Endpoint extends React.PureComponent<Props,State> {
    private className = 'identity-network-endpoint';
    constructor(props: Props) {
        super(props);
        this.state = {
            categoryIdx: 0,
            datasetIdx: -1,
            shapes: []
        }
    }

    public render() {
        const { endpoint } = this.props;
        const c = this.className;

        return (
            <div className={c}>
                <Container fluid={true}>

                    {/* Display and settings */}
                    <Row>
                        <Col md={6}>
                            <TextArea
                                changeHandler={this.handleInputChange} propName={'name'} value={endpoint.name}
                                label='Name' subLabel='Name of endpoint (used only for admin reference, not shown to users)' required={true}
                            />
                            <TextArea 
                                changeHandler={this.handleInputChange} propName={'address'} value={endpoint.address}
                                label='URL' subLabel='Web address (eg, https://leaf.university.edu)' required={true}
                            />
                        </Col>
                        <Col md={6}>
                            <Checkbox
                                 changeHandler={this.handleInputChange} propName={'isResponder'} value={endpoint.isResponder}
                                 label='Our users can query them'
                            />
                            <Checkbox
                                 changeHandler={this.handleInputChange} propName={'isInterrogator'} value={endpoint.isInterrogator}
                                 label='Their users can query us'
                            />
                        </Col>
                    </Row>

                    {/* Certs */}
                    <Row>
                        <Col md={6}>
                            <TextArea
                                changeHandler={this.handleInputChange} propName={'keyId'} value={endpoint.keyId}
                                label='Key ID' subLabel='Key ID for this endpoint' required={true}
                            />
                        </Col>
                        <Col md={6}>
                            <TextArea
                                changeHandler={this.handleInputChange} propName={'issuer'} value={endpoint.issuer}
                                label='Issuer' subLabel='Issuer for this endpoint' required={true}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <TextArea
                                changeHandler={this.handleInputChange} propName={'certificate'} value={endpoint.certificate}
                                label='Certificate' subLabel='Certificate for this endpoint' required={true}
                            />
                        </Col>
                    </Row>

                </Container>
            </div>
        );
    }

    /* 
     * Handle tracking of input changes to the Network Identity.
     */
    private handleInputChange = (val: any, propName: string) => {
        const { dispatch, endpoint } = this.props;
        const newVal = val === '' ? null : val;
        const newEndpoint = Object.assign({}, endpoint, { [propName]: newVal }) as NetworkEndpoint;

        dispatch(setAdminNetworkEndpoint(newEndpoint, true));
    }
}