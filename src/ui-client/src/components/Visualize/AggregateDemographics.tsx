/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Container, Row } from 'reactstrap'
import { CohortState } from '../../models/state/CohortState';
import { SectionHeader } from '../Other/SectionHeader/SectionHeader';
import { AgeByGender } from './AgeByGender';
import { Binary } from './Binary';

export interface Props {
    cohort: CohortState;
    height: number;
    width: number;
}

export default class AggregateDemographics extends React.PureComponent<Props> {
    public render() {
        const { ageByGenderData, binarySplitData } = this.props.cohort.visualization.demographics;
        const colWidth = this.props.width / 2;

        return (
            <Container className="visualize-demographic-container aggregate" fluid={true}>
                <Row>
                    <Col lg={6} md={12} className="visualization-agebygender-container">
                        <SectionHeader headerText="Current Age By Gender" />
                        <AgeByGender 
                            data={ageByGenderData}
                            height={this.props.height} 
                            width={colWidth}
                        />
                    </Col>
                    <Col lg={6} md={12} className="visualization-ataglance-container">
                        <SectionHeader headerText="At a Glance" />
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

