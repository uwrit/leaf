/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import AdminState from '../../../models/state/AdminState';
import { NetworkIdentity } from '../../../models/NetworkResponder';
import { setAdminNetworkIdentity, processApiUpdateQueue, revertAdminNetworkChanges, setAdminNetworkEndpoint } from '../../../actions/admin/networkAndIdentity';
import { NetworkEndpoint } from '../../../models/admin/Network';
import { ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../actions/generalUi';
import { WhatsThis } from '../../Other/WhatsThis/WhatsThis';

interface Props {
    data: AdminState;
    dispatch: any;
}

interface State {
    forceValidation: boolean;
}

export class DowntimesEditor extends React.PureComponent<Props,State> {
    private className = 'downtimes-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            forceValidation: false
        }
    }

    public render() {
        const { dispatch, data } = this.props;
        const { forceValidation } = this.state;
        const { identity, endpoints, changed } = data.networkAndIdentity;
        const c = this.className;

        return (
            <div className={c}>


                <Container fluid={true}>
                    <Row>
                        <Col md={7} className={`${c}-column-left admin-panel-editor`}>

                            {/* Header */}
                            <div className={`${c}-header`}>
                                <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChanges}>Undo Changes</Button>
                                <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveChanges}>Save</Button>
                            </div>

                            {/* Identity */}
                            <div>
                                
                            </div>
                        </Col>

                        {/* Endpoints */}
                        <Col md={5} className={`${c}-column-right admin-panel-editor scrollable-offset-by-header`}>
                            <div>
                                <Button className='leaf-button leaf-button-addnew' onClick={this.handleAddEndpointClick}>+ Add New Networked Leaf Instance</Button>

                                {/* Explanation */}
                                <WhatsThis 
                                    question={'What is a Networked Leaf instance?'}
                                    body={`Leaf instances can be networked/federated by mutually loading certificate information and aligning their 
                                           settings and roles (i.e., who can query who). Note that this must be reciprocal. Once configured, users from
                                           one respective Leaf instance will be able to query both their own data and their networked partners' data.`}
                                />
                            </div>
                            <div className={`${c}-endpoint-container`}>
                                
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    /*
     * Validate that current networks and Identity are valid. Called on 'Save' click.
     */
    private currentNetworkAndIdentityValid = (): boolean => {
        return false
    }

    /* 
     * Handle tracking of input changes to the Network Identity.
     */
    private handleInputChange = (val: any, propName: string) => {
        const { dispatch, data } = this.props;
        const { identity } = data.networkAndIdentity;
        const newVal = val === '' ? null : val;
        const newIdentity = Object.assign({}, identity, { [propName]: newVal }) as NetworkIdentity;

        dispatch(setAdminNetworkIdentity(newIdentity, true));
    }

    /*
     * Revert any identity or network changes made.
     */
    private handleUndoChanges = () => {
        const { dispatch } = this.props;
        dispatch(revertAdminNetworkChanges());
        this.setState({ forceValidation: false });
    }

    /*
     * Handle saving any identity or network changes.
     */
    private handleSaveChanges = () => {
        const { dispatch } = this.props;
        const isValid = this.currentNetworkAndIdentityValid();

        if (isValid) {
            dispatch(processApiUpdateQueue());
        } else {
            const confirm: ConfirmationModalState = {
                body: `One or more Identity fields or networked Leaf instances are missing necessary data. Are you sure you want to save?`,
                header: 'Missing Identity or Network data',
                onClickNo: () => null as any,
                onClickYes: () => { 
                    dispatch(processApiUpdateQueue());
                    this.setState({ forceValidation: false });
                },
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Save Concept`
            };
            dispatch(showConfirmationModal(confirm));
            this.setState({ forceValidation: true });
        }
    }

    /*
     * Generate a random integer id greater than the current max endpoint id.
     */
    private generateSequentialIntegerId = () => {
        const { endpoints } = this.props.data.networkAndIdentity;
        if (!endpoints.size) { return 1; }
        const max = Math.max.apply(Math, [ ...endpoints.values() ].map((s) => s.id));
        return max + 1;
    }

    /*
     * Handle new endpoint to be added.
     */
    private handleAddEndpointClick = () => {
        const { dispatch } = this.props;
        const newEndpoint: NetworkEndpoint = {
            id: this.generateSequentialIntegerId(),
            created: new Date(),
            updated: new Date(),
            name: 'New Endpoint',
            address: 'https://',
            issuer: '',
            keyId: '',
            certificate: '',
            isInterrogator: false,
            isResponder: false,
            unsaved: true
        };
        dispatch(setAdminNetworkEndpoint(newEndpoint, true));
    }
}