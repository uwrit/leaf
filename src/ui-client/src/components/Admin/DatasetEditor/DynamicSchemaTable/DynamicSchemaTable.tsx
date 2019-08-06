/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { DynamicDatasetQuerySchema } from '../../../../models/admin/Dataset';
import { Container, Row, Col } from 'reactstrap';
import { PatientListColumnType } from '../../../../models/patientList/Column';

interface Props {
    schema?: DynamicDatasetQuerySchema;
}

export class DynamicSchemaTable extends React.PureComponent<Props> {
    private className = 'dataset-editor';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { schema } = this.props;

        if (!schema) { return null; }

        return (
            <Container>
                {schema.fields.map(f => (
                    <Row>
                        <Col md={3}>
                            <span>{f.phi}</span>
                        </Col>
                        <Col md={6}>
                            <span>{f.name}</span>
                        </Col>
                        <Col md={3}>
                            <span>{PatientListColumnType[f.type]}</span>
                        </Col>
                    </Row>
                ))}
            </Container>
        )
    }
};
