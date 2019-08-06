/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Display } from '../Sections/Display';
import { SqlEditor } from '../SqlEditor/SqlEditor';
import { Row, Col } from 'reactstrap';
import { Identifiers } from '../Sections/Identifiers';
import { Section } from '../../Section/Section';
import { Constraints } from '../Constraints/Constraints';
import { AdminDatasetQuery, DatasetQueryCategory } from '../../../../models/admin/Dataset';
import { PatientListDatasetShape } from '../../../../models/patientList/Dataset';
import { AdminPanelPatientListColumnTemplate } from '../../../../models/patientList/Column';

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

export class FhirTemplateEditor extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

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
                <Row>
                    <Col md={6}>
                        <Identifiers
                            dataset={dataset}
                            handleInputChange={inputChangeHandler}
                            locked={locked}
                        />
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
