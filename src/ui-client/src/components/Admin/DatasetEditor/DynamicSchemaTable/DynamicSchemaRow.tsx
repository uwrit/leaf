/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { DynamicDatasetQuerySchemaField } from '../../../../models/admin/Dataset';
import { Row, Col } from 'reactstrap';
import { DynamicSchemaFieldTypeDropdown } from './DynamicSchemaFieldTypeDropdown';
import { PatientListColumnType } from '../../../../models/patientList/Column';
import { encounterId, personId } from '../../../../models/patientList/DatasetDefinitionTemplate';
import { FiCheck } from 'react-icons/fi';

interface Props {
    index: number;
    inputChangeHandler: (val: any, propName: string, index: number) => any;
    field: DynamicDatasetQuerySchemaField;
}

const stringOnly = new Set([ personId, encounterId ]);

export class DynamicSchemaRow extends React.PureComponent<Props> {
    private className = 'dataset-editor';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { field, index } = this.props;
        const configurable = !stringOnly.has(field.name);
        const c = this.className;
        const classes = [ `${c}-column`, `${c}-dynamic-column` ];

        if (field.present) {
            classes.push('present');
        }

        return (
            <Row className={classes.join(' ')}>
                <FiCheck />
                <Col md={3} onClick={this.handlePhiClick}>
                    {this.getPhiField()}
                </Col>
                <Col md={6}>
                    <span className={`${c}-column-name`}>{field.name}</span>
                </Col>
                <Col md={3}>
                    {configurable &&
                        <DynamicSchemaFieldTypeDropdown index={index} type={field.type} changeHandler={this.handleTypeChange} />
                    }
                    {!configurable &&
                        <span className={`${c}-column-type`}>string</span>
                    }
                </Col>
            </Row>
        )
    }

    private getPhiField = () => {
        const { field } = this.props;
        const c = this.className;
        const className = field.phi 
            ? `${c}-column-phi`
            : `${c}-column-not-phi`;
        return <span className={className}>De-identify</span>
    }

    private handleTypeChange = (index: number, type: PatientListColumnType) => {
        const { inputChangeHandler } = this.props;
        inputChangeHandler(type, 'type', index);
    }

    private handlePhiClick = () => {
        const { inputChangeHandler, field, index } = this.props;
        inputChangeHandler(!field.phi, 'phi', index);
    }
};
