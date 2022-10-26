/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { Row, Col, Container } from 'reactstrap';
import { AdminDatasetQuery, DatasetQueryCategory } from '../../../../models/admin/Dataset';
import { PatientListDatasetShape } from '../../../../models/patientList/Dataset';
import { Checkbox } from '../../Section/Checkbox';

interface Props {
    categories: Map<number, DatasetQueryCategory>;
    category?: DatasetQueryCategory;
    categoryChangeHandler: (categoryId: number) => any;
    dataset: AdminDatasetQuery;
    dispatch: any;
    inputChangeHandler: (val: any, prop: string) => any;
    forceValidation: boolean;
    locked?: boolean;
    shapeChangeHandler: (shape: number) => any;
    shapes: PatientListDatasetShape[];
}

export class ClassificationProps extends React.PureComponent<Props> {

    public render() {
        const { dataset, inputChangeHandler } = this.props;

        return (
            <Section header='Dataset Type Properties'>
                <Container fluid={true} className={`dataset-editor-dynamic-properties`}>
                    <Row>
                        <Col md={6}>
                            <Checkbox
                                changeHandler={inputChangeHandler} propName={'isDefault'} value={dataset.isDefault} 
                                label='Load by Default' subLabel={'If checked, this dataset will be automatically loaded when users first view the Patient List with no date filter.'}
                            />
                        </Col>
                        <Col md={6}>
                        </Col>
                    </Row>
                </Container>
            </Section>
        );
    }
};
