/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
import { LanguageByHeritage } from './LanguageByHeritage';
import { Religion } from './Religion';
import { NihRaceEthnicityGenderTable } from './NihRaceEthnicityGenderTable';

export interface Props {
    cohort: CohortState;
    height: number;
    width: number;
}

export default class AggregateDemographics extends React.PureComponent<Props> {
    private delayIncrementMs = 600;

    public render() {
        const { ageByGenderData, binarySplitData, languageByHeritageData, religionData, nihRaceEthnicityData } = this.props.cohort.visualization.demographics;
        const colWidth = this.props.width / 2;
        const getDelay = (i: number): number => i * this.delayIncrementMs;

        return (
            <Container className="visualize-demographic-container aggregate" fluid={true}>
                <Row>
                    <Col lg={6} md={12} className="visualization-agebygender-container">
                        <SectionHeader headerText="Current Age By Gender" />
                        <AgeByGender 
                            data={ageByGenderData}
                            delay={getDelay(0)}
                            height={this.props.height} 
                            width={colWidth}
                        />
                    </Col>
                    <Col lg={6} md={12} className="visualization-ataglance-container">
                        <SectionHeader headerText="At a Glance" />
                        <Binary 
                            data={binarySplitData} 
                            delay={getDelay(1)}
                            height={this.props.height}
                            width={colWidth} 
                        />
                    </Col>
                </Row>
                <Row>
                    <Col lg={6} md={12} className="visualization-languagebyheritage-container">
                        <SectionHeader headerText="Ethnic Heritage by Language" />
                        <LanguageByHeritage 
                            bucketset={languageByHeritageData} 
                            delay={getDelay(2)}
                            height={this.props.height}
                            width={colWidth}
                        />
                    </Col>
                    <Col lg={6} md={12} className="visualization-ataglance-container">
                        <SectionHeader headerText="Religious Beliefs" />
                        <Religion
                            counts={religionData} 
                            delay={getDelay(3)}
                            height={this.props.height}
                            width={colWidth}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={12} className="visualization-nih">
                        <SectionHeader 
                            headerText="NIH Race, Ethnicity, and Gender" 
                            subText="Excludes patients missing gender or ethnicity information"
                        />
                    </Col>
                    <Col lg={{ size: 8, order: 2, offset: 2 }} md={12}>
                        <NihRaceEthnicityGenderTable data={nihRaceEthnicityData} />
                    </Col>
                </Row>
            </Container>
        );
    }
}

