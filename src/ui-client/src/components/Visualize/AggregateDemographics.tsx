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
import { LanguageByHeritage } from './LanguageByHeritage';
import { Religion } from './Religion';

export interface Props {
    cohort: CohortState;
    height: number;
    width: number;
}

export default class AggregateDemographics extends React.PureComponent<Props> {
    private delayIncrementMs = 600;

    public render() {
        const { ageByGenderData, binarySplitData, languageByHeritageData, religionData } = this.props.cohort.visualization.demographics;
        const colWidth = this.props.width / 2;
        let delay = 0;
        const getDelay = (): number => { const d = delay; delay += this.delayIncrementMs; return d; }

        return (
            <Container className="visualize-demographic-container aggregate" fluid={true}>
                <Row>
                    <Col lg={6} md={12} className="visualization-agebygender-container">
                        <SectionHeader headerText="Current Age By Gender" />
                        <AgeByGender 
                            data={ageByGenderData}
                            delay={getDelay()}
                            height={this.props.height} 
                            width={colWidth}
                        />
                    </Col>
                    <Col lg={6} md={12} className="visualization-ataglance-container">
                        <SectionHeader headerText="At a Glance" />
                        <Binary 
                            data={binarySplitData} 
                            delay={getDelay()}
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
                            delay={getDelay()}
                            height={this.props.height}
                            width={colWidth}
                        />
                    </Col>
                    <Col lg={6} md={12} className="visualization-ataglance-container">
                        <SectionHeader headerText="Religious Beliefs" />
                        <Religion
                            bucketset={religionData} 
                            delay={getDelay()}
                            height={this.props.height}
                            width={colWidth}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }
}

