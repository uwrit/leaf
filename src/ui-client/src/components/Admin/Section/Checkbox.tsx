/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Row, FormText } from 'reactstrap';
import CheckboxSlider from '../../Other/CheckboxSlider/CheckboxSlider';
import { PropertyProps as Props } from '../ConceptEditor/Props';

export class Checkbox extends React.PureComponent<Props> {
    private className = "admin-panel"
    public render() {
        const { label, subLabel, value } = this.props;
        const c = this.className;
        let val = value || false;

        return (
            <Row className={`${c}-checkbox`}>
                {!!label && 
                [(
                    <Col md={10} key={1}>
                        <div className={`${c}-checkbox-text`}>
                            {label}
                            {subLabel &&
                                <FormText color="muted">{subLabel}</FormText>
                            }
                        </div>
                    </Col>),(
                    <Col md={2} key={2}>
                        <CheckboxSlider checked={val} onClick={this.handleChange} />
                    </Col>)
                ]
                }
                {!label &&
                <CheckboxSlider checked={val} onClick={this.handleChange} />
                }
            </Row>
        );
    }

    private handleChange = () => {
        const { changeHandler, propName, value, locked } = this.props;
        const newVal = !value;
        if (locked) { return; }
        changeHandler(newVal, propName);
    };
};
