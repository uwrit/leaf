/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
    inputChangeHandler: (val: DynamicDatasetQuerySchemaField, index: number) => any;
    field: DynamicDatasetQuerySchemaField;
}

const identifiers = new Set([ personId, encounterId ]);
const deidentifiable = new Set([ PatientListColumnType.String, PatientListColumnType.DateTime ]);

export class DynamicSchemaRow extends React.PureComponent<Props> {
    private className = 'dataset-editor';

    public render() {
        const { field, index } = this.props;
        const configurable = !identifiers.has(field.name);
        const c = this.className;
        const classes = [ `${c}-column`, `${c}-dynamic-column` ];

        if (field.present) {
            classes.push('present');
        }

        return (
            <Row className={classes.join(' ')}>
                <FiCheck />
                {this.getPhiSection()}
                <Col md={6}>
                    <span className={`${c}-column-name`}>{field.name}</span>
                </Col>
                <Col md={3}>
                    {configurable &&
                        <DynamicSchemaFieldTypeDropdown index={index} type={field.type} changeHandler={this.handleTypeChange} />
                    }
                    {!configurable &&
                        <span className={`${c}-column-type`}>String</span>
                    }
                </Col>
            </Row>
        )
    }

    /*
     * Get React components to handle and display column PHI/NoPHI properties.
     */
    private getPhiSection = () => {
        const { field } = this.props;
        const c = this.className;

        if (identifiers.has(field.name)) {
            return (
                <Col md={3}>
                    <span className={`${c}-column-phi ${c}-column-phi-always`}>De-identify</span>
                </Col>
            );
        }
        if (deidentifiable.has(field.type)) {
            return (
                <Col md={3} onClick={this.handlePhiClick}>
                    {this.getDeidentText()}
                </Col>
            );
        }
        return (
            <Col md={3} className={`${c}-column-nodeident`} />
        );
    }

    /*
     * Get <span> with classname depending on whether a field is 
     * marked as PHI or not.
     */
    private getDeidentText = () => {
        const { field } = this.props;
        const c = this.className;
        const className = field.phi 
            ? `${c}-column-phi`
            : `${c}-column-not-phi`;
        return <span className={className}>De-identify</span>
    }

    /*
     * Handle changes to the field's type. If DateTime, auto-de-identify.
     */
    private handleTypeChange = (index: number, type: PatientListColumnType) => {
        const { inputChangeHandler, field } = this.props;
        const newField = Object.assign({}, field, { type })

        if (type === PatientListColumnType.DateTime) {
            newField.mask = true;
            newField.phi = true;
        } else {
            newField.mask = false;
            newField.phi = false;
        }

        inputChangeHandler(newField, index);
    }

    /*
     * Handle clicks to change whether a field is de-identified or not.
     */
    private handlePhiClick = () => {
        const { inputChangeHandler, field, index } = this.props;
        const deident = !field.phi;
        const newField = Object.assign({}, field, { phi: deident, mask: deident })
        inputChangeHandler(newField, index);
    }
};
