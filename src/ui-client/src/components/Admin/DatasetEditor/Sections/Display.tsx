/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { TextArea } from '../../Section/TextArea';
import { Row, Col } from 'reactstrap';
import { AdminDatasetQuery, DatasetQueryCategory } from '../../../../models/admin/Dataset';
import { PatientListDatasetShape } from '../../../../models/patientList/Dataset';
import { CategoryDropdown } from '../CategoryDropdown/CategoryDropdown';
import { ShapeDropdown } from '../ShapeDropdown/ShapeDropdown';

interface Props {
    categoryChangeHandler: (categoryId: number) => any;
    category?: DatasetQueryCategory;
    categories: Map<number, DatasetQueryCategory>;
    dataset: AdminDatasetQuery;
    dispatch: any;
    forceValidation: boolean;
    inputChangeHandler: (val: any, propName: string) => any;
    locked?: boolean;
    shapeChangeHandler: (shape: PatientListDatasetShape) => any;
    shape: PatientListDatasetShape;
    shapes: PatientListDatasetShape[];
}

export class Display extends React.PureComponent<Props> {
    public render() {
        const { category, categories, categoryChangeHandler, dataset, dispatch, inputChangeHandler, locked, forceValidation, shapes, shapeChangeHandler } = this.props;
        return (
            <Section header='Display'>
                <Row>
                    <Col md={4}>
                    <TextArea 
                        changeHandler={inputChangeHandler} propName={'name'} value={dataset.name}
                        label='Name' required={true} subLabel='Text for this Dataset' locked={locked}
                        forceValidation={forceValidation} errorText='Enter a Name'
                    />
                    </Col>
                    <Col md={4}>
                        <CategoryDropdown
                            changeHandler={categoryChangeHandler} 
                            dispatch={dispatch} 
                            currentCategory={category} 
                            categories={categories}
                            locked={locked}
                        />
                    </Col>
                    <Col md={4}>
                        <ShapeDropdown 
                            dispatch={dispatch} 
                            shapes={shapes} 
                            selected={dataset.shape} 
                            clickHandler={shapeChangeHandler} 
                            locked={locked}
                        />
                    </Col>
                </Row>
            </Section>
        );
    }
};
