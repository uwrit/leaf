/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { DynamicDatasetQuerySchema, DynamicDatasetQuerySchemaField } from '../../../../models/admin/Dataset';
import { Container } from 'reactstrap';
import { DynamicSchemaRow } from './DynamicSchemaRow';
import './DynamicSchemaTable.css';

interface Props {
    inputChangeHandler: (val: any, propName: string) => any;
    schema?: DynamicDatasetQuerySchema;
}

export class DynamicSchemaTable extends React.PureComponent<Props> {
    public render() {
        const { schema } = this.props;

        if (!schema) { return null; }

        return (
            <Container>
                {schema.fields.map((f,i) => (
                    <DynamicSchemaRow key={f.name} index={i} field={f} inputChangeHandler={this.handleInputChange2} />
                ))}
            </Container>
        )
    }

    /* 
     * Handle tracking of input changes to the dataset.
     */
    private handleInputChange = (val: any, propName: string, index: number) => {
        const { inputChangeHandler, schema } = this.props;
        const newSchema = Object.assign({}, schema);
        const fields = newSchema!.fields.slice();
        const changed = Object.assign({}, fields[index], { [propName]: val });
        fields[index] = changed;
        newSchema.fields = fields;

        inputChangeHandler(newSchema, 'schema');
    }

    private handleInputChange2 = (val: DynamicDatasetQuerySchemaField, index: number) => {
        const { inputChangeHandler, schema } = this.props;
        const newSchema = Object.assign({}, schema);
        const fields = newSchema!.fields.slice();
        fields[index] = val;
        newSchema.fields = fields;

        inputChangeHandler(newSchema, 'schema');
    }
};
