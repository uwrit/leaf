/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import ConceptColumnContainer from '../../../containers/FindPatients/ConceptColumnContainer';
import AdminState from '../../../models/state/AdminState';
import './PanelFilterEditor.css';

interface Props { 
    data: AdminState;
    dispatch: any;
}

interface State {
    
}

export class PanelFilterEditor extends React.PureComponent<Props,State> {
    private className = 'panelfilter-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            
        }
    }

    public render() {
        const { data, dispatch } = this.props;
        const c = this.className;

        return (
            <div className={c}>
                <Container fluid={true}>
                    <Row className={`${c}-container-row`}>
                        <Col md={4} lg={4} xl={5} className={`${c}-column-left`}>
                            <ConceptColumnContainer />
                        </Col>
                        <div className={`${c}-column-right admin-panel-editor scrollable-offset-by-header`}>
                            
                        </div>
                    </Row>
                </Container>
            </div>
        );
    }
}