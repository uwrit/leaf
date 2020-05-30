/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import ConceptColumnContainer from '../../containers/FindPatients/ConceptColumnContainer'
import PanelGroupColumn from './Panels/PanelGroupColumn';
import './FindPatients.css';

export class FindPatients extends React.PureComponent {
    
    public render() {
        return (
            <Container fluid={true}>
                <Row className="find-patients-screen">
                    <Col md={4} lg={4} xl={5} className="find-patients-column-left">
                        <ConceptColumnContainer />
                    </Col>
                    <Col md={8} lg={8} xl={7} className="find-patients-column-right scrollable-offset-by-header">
                        <PanelGroupColumn />
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default FindPatients;