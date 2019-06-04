/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import AdminState from '../../../models/state/AdminState';
import './NetworkAndIdentityEditor.css';
import { Display } from './Sections/Display';
import { NetworkIdentity } from '../../../models/NetworkResponder';
import { setAdminNetworkIdentity } from '../../../actions/admin/networkAndIdentity';
import { IdentityPreview } from './Sections/IdentityPreview';
import { Endpoint } from '../Endpoint/Endpoint';


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
        const { identity, endpoints } = data.networkAndIdentity;
        const c = this.className;

        return (
            <div className={c}>
                <Container fluid={true}>
                    <Row>
                        <Col md={7} className={`${c}-column-left admin-panel-editor`}>
                            <div>
                                <Display
                                    changeHandler={this.handleInputChange}
                                    identity={identity}
                                />
                                <IdentityPreview 
                                    dispatch={dispatch}
                                    identity={identity}
                                />
                            </div>
                        </Col>
                        <Col md={5} className={`${c}-column-right admin-panel-editor`}>
                            <div>
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
}