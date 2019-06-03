/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { TextArea } from '../../Section/TextArea';
import { NetworkIdentity } from '../../../../models/NetworkResponder';
import { Row, Col } from 'reactstrap';
import { Input } from '../../Section/Input';

interface Props {
    changeHandler: (val: any, propName: string) => any;
    identity: NetworkIdentity;
}

export class Display extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { changeHandler, identity } = this.props;
        return (
            <Section header='Display'>

                {/* Name and Abbreviation */}
                <Row>
                    <Col md={6}>
                        <TextArea 
                            changeHandler={changeHandler} propName={'name'} value={identity.name}
                            label='Full Name' subLabel='Name shown to users' required={true}
                        />
                    </Col>
                    <Col md={6}>
                        <TextArea 
                            changeHandler={changeHandler} propName={'abbreviation'} value={identity.abbreviation}
                            label='Abbreviation' subLabel='Abbreviated name shown next to query results' required={true}
                        />
                    </Col>
                </Row>

                {/* Description */}
                <Row>
                    <Col md={12}>
                        <TextArea 
                            changeHandler={changeHandler} propName={'description'} value={identity.description}
                            label='Description' subLabel='Descriptive text shown when users hover over the "Databases" icon in the upper-right'
                        />
                    </Col>
                </Row>

                {/* Color, coords, and total patients */}
                <Row>
                    <Col md={6}>
                        <Input
                            changeHandler={changeHandler} propName={'totalPatients'} value={identity.totalPatients}
                            label='Total Patients' subLabel='Approximate number of total patients' type='number'
                        />
                        <Input 
                            changeHandler={changeHandler} propName={'primaryColor'} value={identity.primaryColor}
                            label='Primary Color' subLabel='Primary color shown next to name' required={true}
                        />
                    </Col>
                    <Col md={6}>
                        <Input 
                            changeHandler={changeHandler} propName={'latitude'} value={identity.latitude}
                            label='Latitude' subLabel='Latitudinal point used for display on the map' type='number'
                        />
                        <Input 
                            changeHandler={changeHandler} propName={'longitude'} value={identity.longitude}
                            label='Longitude' subLabel='Longitudinal point used for display on the map' type='number'
                        />
                    </Col>
                </Row>
            </Section>
        );
    }
};
