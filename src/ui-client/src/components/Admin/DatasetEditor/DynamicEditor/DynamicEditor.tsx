/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Display } from '../Sections/Display';
import { SqlEditor } from '../SqlEditor/SqlEditor';
import { Row, Col } from 'reactstrap';
import { Section } from '../../Section/Section';
import { Constraints } from '../Constraints/Constraints';
import { AdminDatasetQuery, DatasetQueryCategory } from '../../../../models/admin/Dataset';
import { PatientListDatasetShape } from '../../../../models/patientList/Dataset';
import { AdminPanelPatientListColumnTemplate } from '../../../../models/patientList/Column';
import { Tagger } from '../Tagger/Tagger';
import { DynamicDatasetProps } from '../DynamicDatasetProps/DynamicDatasetProps';

interface Props {
    categories: Map<number, DatasetQueryCategory>;
    category?: DatasetQueryCategory;
    categoryChangeHandler: (categoryId: number) => any;
    dataset: AdminDatasetQuery;
    dispatch: any;
    expectedColumns: AdminPanelPatientListColumnTemplate[];
    inputChangeHandler: (val: any, prop: string) => any;
    locked: boolean;
    forceValidation: boolean;
    shapeChangeHandler: (shapeId: number) => any;
    shape: PatientListDatasetShape;
    shapes: PatientListDatasetShape[];
}

export class DynamicEditor extends React.PureComponent<Props> {
    public render() {
        const { expectedColumns, dataset, dispatch, inputChangeHandler, locked, forceValidation } = this.props;
        return (
            <div>
                <Display {...this.props} />
                <SqlEditor
                    dataset={dataset}
                    dispatch={dispatch}
                    expectedColumns={expectedColumns}
                    handleInputChange={inputChangeHandler}
                />
                <DynamicDatasetProps {...this.props} />
                <Row>
                    <Col md={6}>
                        <Section header='Identifiers'>
                            <Tagger
                                changeHandler={inputChangeHandler} propName={'tags'} tags={dataset ? dataset.tags : []} locked={locked}
                            />
                        </Section>
                    </Col>
                    <Col md={6}>
                        <Section header='Access Restrictions'>
                            <Constraints
                                dataset={dataset} 
                                changeHandler={inputChangeHandler} 
                                forceValidation={forceValidation}
                                locked={locked}
                            />
                        </Section>
                    </Col>
                </Row>
            </div>
        );
    }
};
