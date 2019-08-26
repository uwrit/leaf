/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Container, Row } from 'reactstrap'
import { NetworkCohortState } from '../../models/state/CohortState';
import { NetworkIdentity } from '../../models/NetworkResponder';
import { AgeByGender } from './AgeByGender';
import { Binary } from './Binary';

export interface Props {
    cohort: NetworkCohortState;
    height: number;
    responder: NetworkIdentity;
    width: number;
}

export default class ResponderDemographics extends React.PureComponent<Props> {
    private className = 'visualize-responder';

    public render() {
        const { ageByGenderData, binarySplitData } = this.props.cohort.visualization.demographics;
        const { primaryColor, name, enabled } = this.props.responder;
        const colWidth = this.props.width / 2;
        const c = this.className;

        if (!enabled) { return null; }

        return (
            <Container className="visualize-demographic-container responder" fluid={true}>
                <div className={`${c}-container`}>
                    <div className={`${c}-name`} style={{ color: primaryColor }}>{name}</div>
                </div>
                <Row>
                    <Col lg={6} md={12} className="visualization-agebygender-container">
                        <AgeByGender 
                            data={ageByGenderData} 
                            height={this.props.height}
                            width={colWidth} 
                        />
                    </Col>
                    <Col lg={6} md={12} className="visualization-ataglance-container">
                        <Binary 
                            data={binarySplitData} 
                            height={this.props.height}
                            width={colWidth} 
                        />
                    </Col>
                </Row>
            </Container>
        );
    }
}

