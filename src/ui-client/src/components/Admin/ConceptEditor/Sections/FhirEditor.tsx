/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { TextArea } from '../../Section/TextArea';
import { SectionProps } from '../Props';
import { ShapeDropdown } from './ShapeDropdown';
import { PatientListDatasetShape } from '../../../../models/patientList/Dataset';
import { Col, FormText, Label, Row } from 'reactstrap';

interface Props {
    data: SectionProps;
}

export class FhirEditor extends React.PureComponent<Props> {

    public render() {
        const { data } = this.props;
        const { adminConcept } = data;
        return (
            <Section header='FHIR'>
                <Row className='concept-editor-fhir-label'>
                    <Label>
                        FHIR Resource & Search Parameters
                        <FormText color="muted">Select the FHIR parameters to query by</FormText>
                    </Label>
                </Row>
                <Row className='concept-editor-fhir-values'>
                    <Col md={5}>
                        <ShapeDropdown 
                            clickHandler={this.handleShapeClick} selected={adminConcept!.fhirResourceShapeId}
                        />
                    </Col>
                    <Col md={7}>
                        <TextArea 
                            changeHandler={this.handleFhirUpdate} propName={'fhirSearchParameters'} value={adminConcept!.fhirSearchParameters}
                        />
                    </Col>
                </Row>
            </Section>
        );
    }

    private handleShapeClick = (shape: PatientListDatasetShape) => {
        const { changeHandler } = this.props.data;
        changeHandler(shape, 'fhirResourceShapeId');
    }

    private handleFhirUpdate = (val: any, propName: string) => {
        const { changeHandler } = this.props.data;
        changeHandler(val, propName);
    }
};
