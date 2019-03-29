/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Label, FormText } from 'reactstrap';
import TextareaAutosize from 'react-textarea-autosize'
import { PropertyProps as Props } from '../Props';

export class TextArea extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { label, subLabel, locked, value, focusToggle } = this.props;
        let val = value || '';
        return (
            <FormGroup>
                <Label>
                    {label}
                    {subLabel &&
                    <FormText color="muted">{subLabel}</FormText>
                    }
                </Label>
                <div>
                    <TextareaAutosize 
                        className="leaf-input"
                        minRows={1}
                        maxRows={5}
                        onBlur={this.handleBlur}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        readOnly={locked}
                        spellCheck={false}
                        value={val}
                    />
                </div>
            </FormGroup>
        );
    }

    private handleBlur = () => {
        const { focusToggle } = this.props;
        if (focusToggle) { focusToggle(false); }
    }

    private handleFocus = () => {
        const { focusToggle } = this.props;
        if (focusToggle) { focusToggle(true); }
    }

    private handleChange = (e: any) => {
        const { changeHandler, propName } = this.props;
        const newVal = e.currentTarget.value;
        changeHandler(newVal, propName);
    };
};
