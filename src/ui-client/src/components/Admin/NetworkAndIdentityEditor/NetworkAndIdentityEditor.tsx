/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import AdminState from '../../../models/state/AdminState';
import { Identity } from './Sections/Identity';
import { NetworkIdentity } from '../../../models/NetworkResponder';
import { setAdminNetworkIdentity, processApiUpdateQueue, revertAdminNetworkChanges, setAdminNetworkEndpoint } from '../../../actions/admin/networkAndIdentity';
import { IdentityPreview } from './Sections/IdentityPreview';
import { Endpoint } from './Endpoint/Endpoint';
import { NetworkEndpoint } from '../../../models/admin/Network';
import './NetworkAndIdentityEditor.css';


interface Props {
    data: AdminState;
    dispatch: any;
}

interface State {
}

export class NetworkAndIdentityEditor extends React.PureComponent<Props,State> {
    private className = 'identity-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            categoryIdx: 0,
            datasetIdx: -1,
            shapes: []
        }
    }

    public render() {
        const { dispatch, data } = this.props;
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
                                <Identity
                                    changeHandler={this.handleInputChange}
                                    identity={identity}
                                />
                                <IdentityPreview 
                                    dispatch={dispatch}
                                    identity={identity}
                                />
                            </div>
                        </Col>

                        {/* Endpoints */}
                        <Col md={5} className={`${c}-column-right admin-panel-editor`}>
                            <div>
                                <Button className='leaf-button leaf-button-addnew' onClick={this.handleAddEndpointClick}>+ Add New Networked Leaf Instance</Button>
                            </div>
                            <div className={`${c}-column-right endpoint-container`}>
                                {[ ...endpoints.values() ].map((e) => (
                                    <Endpoint
                                        key={e.id}
                                        dispatch={dispatch}
                                        endpoint={e}
                                    />
                                ))}
                            </div>
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
    }

    /*
     * Handle saving any identity or network changes.
     */
    private handleSaveChanges = () => {
        const { dispatch, data } = this.props;
        const { changed } = data.networkAndIdentity;
        if (changed) {
            dispatch(processApiUpdateQueue());
        }
    }

    /*
     * Generate a random integer id greater than the current max endpoint id.
     */
    private generateRandomIntegerId = () => {
        const { endpoints } = this.props.data.networkAndIdentity;

        /* 
         * Ensure the value is greater than the max endpoint id so it appears sorted below it.
         */
        const min = endpoints.size > 0
            ? Math.max.apply(Math, [ ...endpoints.values() ].map((s) => s.id)) 
            : 1;
        const max = 10000;
        return Math.ceil(Math.random() * (max - min) + min);
    }

    /*
     * Handle new endpoint to be added.
     */
    private handleAddEndpointClick = () => {
        const { dispatch, data } = this.props;
        const newEndpoint: NetworkEndpoint = {
            id: this.generateRandomIntegerId(),
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