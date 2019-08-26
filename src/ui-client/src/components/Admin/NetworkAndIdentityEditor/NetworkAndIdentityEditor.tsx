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
import CertModal from './CertModal/CertModal';
import { ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../actions/generalUi';
import './NetworkAndIdentityEditor.css';

interface Props {
    data: AdminState;
    dispatch: any;
}

interface State {
    forceValidation: boolean;
}

export class NetworkAndIdentityEditor extends React.PureComponent<Props,State> {
    private className = 'identity-editor';
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

                {/* Certificate info modal */}
                <CertModal dispatch={dispatch} data={data.networkAndIdentity.modal} />

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
                                <Identity changeHandler={this.handleInputChange} identity={identity} forceValidation={forceValidation} />
                                <IdentityPreview dispatch={dispatch} identity={identity} />
                            </div>
                        </Col>

                        {/* Endpoints */}
                        <Col md={5} className={`${c}-column-right admin-panel-editor scrollable-offset-by-header`}>
                            <div>
                                <Button className='leaf-button leaf-button-addnew' onClick={this.handleAddEndpointClick}>+ Add New Networked Leaf Instance</Button>
                            </div>
                            <div className={`${c}-endpoint-container`}>
                                {[ ...endpoints.values() ]
                                .sort((a,b) => a.id > b.id ? -1 : 1)
                                .map((e) => (
                                    <Endpoint key={e.id} dispatch={dispatch} endpoint={e} forceValidation={forceValidation} />
                                ))}
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
        const { endpoints, identity } = this.props.data.networkAndIdentity;

        if (!identity.name) { return false; }
        if (!identity.abbreviation) { return false; }
        if (!identity.primaryColor) { return false; }
        for (const endpoint of [ ...endpoints.values() ]) {
            if (endpoint.changed || endpoint.unsaved) {
                if (!endpoint.address) { return false; }
                if (!endpoint.name) { return false; }
                if (!endpoint.keyId) { return false; }
                if (!endpoint.issuer) { return false; }
                if (!endpoint.certificate) { return false; }
            }
        }
        return true;
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
                onClickNo: () => null,
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