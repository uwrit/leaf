/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Container, Row, Col, Collapse, Button } from 'reactstrap';
import { TextArea } from '../../Section/TextArea';
import { setAdminNetworkEndpoint, removeAdminNetworkEndpoint, deleteNetworkEndpoint, attemptLoadRemoteLeafCert } from '../../../../actions/admin/networkAndIdentity';
import { Checkbox } from '../../Section/Checkbox';
import { FaChevronDown } from 'react-icons/fa';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../../actions/generalUi';
import { NetworkEndpoint } from '../../../../models/admin/Network';

interface Props {
    endpoint: NetworkEndpoint;
    dispatch: any;
    forceValidation: boolean;
}

interface State {
    showDetails: boolean;
}

export class Endpoint extends React.PureComponent<Props,State> {
    private className = 'identity-network-endpoint';
    constructor(props: Props) {
        super(props);
        this.state = {
            showDetails: false
        }
    }

    public render() {
        const { endpoint, forceValidation } = this.props;
        const { showDetails } = this.state;
        const c = this.className;
        const toggleClasses = [ `${c}-dropdown-toggle` ];
        let toggleText = 'Show Certificate';

        if (showDetails) {
            toggleClasses.push('open');
            toggleText = 'Hide Certificate';
        }

        return (
            <div className={c}>
                <Container fluid={true}>

                    {/* Unsaved notifier */}
                    {(endpoint.unsaved || endpoint.changed) &&
                    <span className={`${c}-unsaved`}>unsaved</span>
                    }

                    {/* Delete */}
                    <div className={`${c}-delete`}>
                        <span onClick={this.handleDeleteClick}>Delete</span>
                    </div>

                    {/* Display and settings */}
                    <Row>
                        <Col md={6}>
                            <TextArea
                                changeHandler={this.handleInputChange} propName={'name'} value={endpoint.name} forceValidation={forceValidation}
                                label='Name' subLabel='Name of endpoint (not shown to users)' required={true} errorText='Enter a Name'
                            />
                        </Col>
                        <Col md={6}>
                            <TextArea 
                                changeHandler={this.handleInputChange} propName={'address'} value={endpoint.address} forceValidation={forceValidation}
                                label='URL' subLabel='Web address (eg, https://leaf.university.edu)' required={true} errorText='Enter a URL'
                            />
                        </Col>
                    </Row>
                    <Row className={`${c}-relation-toggles`}>
                        <Col md={6}>
                            <Row>
                                <Col md={12}>
                                    <Checkbox
                                        changeHandler={this.handleInputChange} propName={'isResponder'} value={endpoint.isResponder}
                                        label='We can query them'
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Checkbox
                                        changeHandler={this.handleInputChange} propName={'isInterrogator'} value={endpoint.isInterrogator}
                                        label='They can query us'
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {/* Show cert dropdown toggle */}
                    <div className={toggleClasses.join(' ')} onClick={this.handleShowCertDetailsClick}>
                        <span>{toggleText}</span>
                        <FaChevronDown />
                    </div>

                    {/* Test Connection */}
                    <Button className={`${c}-cert-test leaf-button leaf-button-addnew`} onClick={this.handleLoadCertInfoTest}>
                        Load Certificate
                    </Button>

                    {/* Certs */}
                    <Collapse isOpen={showDetails} className={`${c}-cert-collapse`}>
                        <Row className={`${c}-cert-container`}>
                            <Col md={6}>
                                <TextArea
                                    changeHandler={this.handleInputChange} propName={'keyId'} value={endpoint.keyId} forceValidation={forceValidation}
                                    label='Key ID' subLabel='Key ID for this endpoint' required={true} locked={true} errorText='Load a Key ID'
                                />
                            </Col>
                            <Col md={6}>
                                <TextArea
                                    changeHandler={this.handleInputChange} propName={'issuer'} value={endpoint.issuer} forceValidation={forceValidation}
                                    label='Issuer' subLabel='Issuer for this endpoint' required={true} locked={true} errorText='Load an Issuer'
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <TextArea
                                    changeHandler={this.handleInputChange} propName={'certificate'} value={endpoint.certificate} forceValidation={forceValidation}
                                    label='Certificate' subLabel='Certificate for this endpoint' required={true} locked={true} errorText='Load a Certificate'
                                />
                            </Col>
                        </Row>
                    </Collapse>
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
        const newEndpoint = Object.assign({}, endpoint, { [propName]: newVal, changed: true }) as NetworkEndpoint;

        dispatch(setAdminNetworkEndpoint(newEndpoint, true));
    }

    /* 
     * Handle a delete click, which removes the endpoint.
     */
    private handleDeleteClick = () => {
        const { endpoint, dispatch } = this.props;

        if (endpoint.unsaved) {
            dispatch(removeAdminNetworkEndpoint(endpoint));
        } else {
            const confirm: ConfirmationModalState = {
                body: `Are you sure you want to delete the endpoint "${endpoint.name}" (id "${endpoint.id}")? This can't be undone.`,
                header: 'Delete Endpoint',
                onClickNo: () => null as any,
                onClickYes: () => dispatch(deleteNetworkEndpoint(endpoint)),
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Delete Endpoint`
            };
            dispatch(showConfirmationModal(confirm));
        }
    }

    /* 
     * Toggles whether the certificate details should be shown.
     */
    private handleShowCertDetailsClick = () => {
        this.setState({ showDetails: !this.state.showDetails });
    }

    /*
     * Handle certificate test run. This attempts to call the remote Leaf
     * instance in the URL entered and returns cert data on success.
     */
    private handleLoadCertInfoTest = () => {
        const { endpoint, dispatch } = this.props;
        dispatch(attemptLoadRemoteLeafCert(endpoint));
    }
}