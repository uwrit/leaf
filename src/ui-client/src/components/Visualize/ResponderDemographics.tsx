/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
import { SectionHeader } from '../Other/SectionHeader/SectionHeader';
import { LanguageByHeritage } from './LanguageByHeritage';
import { Religion } from './Religion';
import { NihRaceEthnicityGenderTable } from './NihRaceEthnicityGenderTable';

export interface Props {
    cohort: NetworkCohortState;
    height: number;
    responder: NetworkIdentity;
    width: number;
}

export default class ResponderDemographics extends React.PureComponent<Props> {
    private className = 'visualize-responder';
    private delayIncrementMs = 600;

    public render() {
        const { ageByGenderData, binarySplitData, languageByHeritageData, religionData, nihRaceEthnicityData } = this.props.cohort.visualization.demographics;
        const { primaryColor, name, enabled } = this.props.responder;
        const colWidth = this.props.width / 2;
        const c = this.className;
        let delay = 0;
        const getDelay = (): number => { const d = delay; delay += this.delayIncrementMs; return d; }

        if (!enabled) { return null; }

        return (
            <Container className="visualize-demographic-container responder" fluid={true}>
                <div className={`${c}-container`}>
                    <div className={`${c}-name`} style={{ color: primaryColor }}>{name}</div>
                </div>
                <Row>
                    <Col lg={6} md={12} className="visualization-agebygender-container">
                        <SectionHeader headerText="Age by Gender" />
                        <AgeByGender 
                            data={ageByGenderData} 
                            delay={0}
                            height={this.props.height}
                            width={colWidth} 
                        />
                    </Col>
                    <Col lg={6} md={12} className="visualization-ataglance-container">
                        <SectionHeader headerText="At a Glance" />
                        <Binary 
                            data={binarySplitData} 
                            delay={300}
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
                            counts={religionData} 
                            delay={getDelay()}
                            height={this.props.height}
                            width={colWidth}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={12} className="visualization-nih">
                        <SectionHeader headerText="NIH Race, Ethnicity, and Gender" />
                    </Col>
                    <Col lg={{ size: 8, order: 2, offset: 2 }} md={12}>
                        <NihRaceEthnicityGenderTable data={nihRaceEthnicityData} />
                    </Col>
                </Row>
            </Container>
        );
    }
}

