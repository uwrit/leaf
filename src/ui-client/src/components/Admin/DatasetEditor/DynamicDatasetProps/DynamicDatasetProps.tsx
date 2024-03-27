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
import { PatientListColumnType } from '../../../../models/patientList/Column';
import { DynamicPropDropdown } from '../DynamicPropDropdown/DynamicPropDropdown';
import { Checkbox } from '../../Section/Checkbox';
import { personId, encounterId } from '../../../../models/patientList/DatasetDefinitionTemplate';

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

export class DynamicDatasetProps extends React.PureComponent<Props> {

    public render() {
        const { dataset, inputChangeHandler } = this.props;
        const numCols: string[] = [];
        const strCols: string[] = [];
        const dateCols: string[] = [];
        const locked = !dataset.isEncounterBased;

        dataset.schema!.fields.forEach(f => {
            if (f.name !== personId && f.name !== encounterId) {
                if      (f.type === PatientListColumnType.String) strCols.push(f.name);
                else if (f.type === PatientListColumnType.Numeric) numCols.push(f.name);
                else if (f.type === PatientListColumnType.DateTime)   dateCols.push(f.name);
            }
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
                        </Col>
                        <Col md={6}>
                            {dataset.isEncounterBased &&
                            <DynamicPropDropdown
                                clickHandler={inputChangeHandler} label={'Date Column'} options={dateCols} prop={'sqlFieldDate'}
                                selected={dataset.sqlFieldDate} sublabel={'Date-type column to summarize the earliest and latest rows. Required if dataset has encounters'}
                                locked={locked} required={true}
                            />}
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Checkbox
                                changeHandler={inputChangeHandler} propName={'isNote'} value={dataset.isNote} 
                                label='Is Clinical Note or Document' subLabel={'If checked, the dataset will be made available for text search using the Note Search feature'}
                            />
                        </Col>
                        <Col md={6}>
                            {dataset.isNote &&
                            <DynamicPropDropdown
                                clickHandler={inputChangeHandler} label={'De-identified Note String Column'} options={strCols} prop={'sqlFieldDeidValueString'}
                                selected={dataset.sqlFieldDeidValueString} sublabel={'Column of de-identified note text. If available, this de-identified text will be used for Note Search in De-identified Mode. If not, the dataset will only be available in Identified Mode.'}
                                locked={locked}
                            />}
                        </Col>
                    </Row>

                    {dataset.isEncounterBased &&
                    <Row>
                        <Col md={6}>
                            <DynamicPropDropdown
                                clickHandler={inputChangeHandler} label={'String Value Column'} options={strCols} prop={'sqlFieldValueString'}
                                selected={dataset.sqlFieldValueString} sublabel={'String-type column to summarize the earliest and latest row values. If the dataset represents Clinical Notes, this column should have the identified text'}
                                locked={locked} required={true}
                            />
                        </Col>
                        <Col md={6}>
                            <DynamicPropDropdown 
                                clickHandler={inputChangeHandler} label={'Numeric Value Column'} options={numCols} prop={'sqlFieldValueNumeric'}
                                selected={dataset.sqlFieldValueNumeric} sublabel={'Optional numeric-type column. If a column is selected, the dataset will be assumed to be numeric and statistical summaries generated for each patient'}
                                locked={locked}
                            />
                        </Col>
                    </Row>}

                </Container>
            </Section>
        );
    }
};
