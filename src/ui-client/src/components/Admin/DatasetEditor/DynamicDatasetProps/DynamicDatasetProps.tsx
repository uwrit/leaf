/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { TextArea } from '../../Section/TextArea';
import { Row, Col, Container } from 'reactstrap';
import { AdminDatasetQuery, DatasetQueryCategory } from '../../../../models/admin/Dataset';
import { PatientListDatasetShape } from '../../../../models/patientList/Dataset';
import { AdminPanelPatientListColumnTemplate, PatientListColumnType } from '../../../../models/patientList/Column';
import { DynamicPropDropdown } from '../DynamicPropDropdown/DynamicPropDropdown';
import { Checkbox } from '../../Section/Checkbox';

interface Props {
    categories: Map<number, DatasetQueryCategory>;
    category?: DatasetQueryCategory;
    categoryChangeHandler: (categoryId: number) => any;
    dataset: AdminDatasetQuery;
    dispatch: any;
    expectedColumns: AdminPanelPatientListColumnTemplate[];
    inputChangeHandler: (val: any, prop: string) => any;
    forceValidation: boolean;
    locked?: boolean;
    shapeChangeHandler: (shape: number) => any;
    shapes: PatientListDatasetShape[];
}

export class DynamicDatasetProps extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { categories, category, categoryChangeHandler, expectedColumns, dataset, inputChangeHandler, forceValidation, shapeChangeHandler, shapes } = this.props;
        const numCols: string[] = [];
        const strCols: string[] = [];
        const dateCols: string[] = [];
        const locked = !dataset.isEncounterBased;

        expectedColumns.forEach(c => {
            if      (c.type === PatientListColumnType.string) strCols.push(c.id);
            else if (c.type === PatientListColumnType.number) numCols.push(c.id);
            else if (c.type === PatientListColumnType.date)   dateCols.push(c.id);
        })


        return (
            <Section header='Dynamic Properties'>
                <Container fluid={true} className={`dataset-editor-dynamic-properties`}>
                    <Row>
                        <Col md={6}>
                            <Checkbox
                                changeHandler={inputChangeHandler} propName={'isEncounterBased'} value={dataset.isEncounterBased} 
                                label='Has Encounters' subLabel={'If checked, this dataset will be assumed to have multiple rows per patient with associated date and encounterId columns'}
                            />
                            <Row>
                                {dataset.isEncounterBased &&
                                <DynamicPropDropdown
                                    clickHandler={inputChangeHandler} label={'Date Column'} options={dateCols} prop={'sqlFieldDate'}
                                    selected={dataset.sqlFieldDate} sublabel={'Optional date-type column to summarize the earliest and latest rows'}
                                    locked={locked} required={true}
                                />
                                }
                            </Row>
                        </Col>
                        <Col md={6}>
                            <Row>
                                {dataset.isEncounterBased &&
                                <DynamicPropDropdown
                                    clickHandler={inputChangeHandler} label={'String Value Column'} options={strCols} prop={'sqlFieldValueString'}
                                    selected={dataset.sqlFieldValueString} sublabel={'Optional string-type column to summarize the earliest and latest row values. If a Numeric Value Column is defined this will be ignored'}
                                    locked={locked}
                                />
                                }
                            </Row>
                            <Row>
                                {dataset.isEncounterBased &&
                                <DynamicPropDropdown 
                                    clickHandler={inputChangeHandler} label={'Numeric Value Column'} options={numCols} prop={'sqlFieldValueNumeric'}
                                    selected={dataset.sqlFieldValueNumeric} sublabel={'Optional numeric-type column to provide statistical summary values'}
                                    locked={locked}
                                />
                                }
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </Section>
        );
    }
};
