/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Container, Row } from 'reactstrap'
import { NetworkCohortState } from '../../models/state/CohortState';
import { NetworkIdentity } from '../../models/NetworkRespondent';
import { AgeByGender } from './AgeByGender';
import { Binary } from './Binary';

export interface Props {
    cohort: NetworkCohortState;
    height: number;
    respondent: NetworkIdentity;
    width: number;
}

export default class RespondentDemographics extends React.PureComponent<Props> {
    private className = 'visualize-respondent';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { ageByGenderData, binarySplitData } = this.props.cohort.visualization.demographics;
        const { value } = this.props.cohort.count;
        const { primaryColor, name, enabled } = this.props.respondent;
        const colWidth = this.props.width / 2;
        const c = this.className;

        if (!enabled) { return null; }

        return (
            <Container className="visualize-demographic-container respondent" fluid={true}>
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

