/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Input as BSInput, Label, FormText } from 'reactstrap';
import { PropertyProps as Props } from '../Props';

export class Input extends React.PureComponent<Props> {
    public render() {
        const { label, subLabel, locked, type, value, focusToggle } = this.props;
        let t = type || 'string' as any;
        let val = value || '';

        return (
            <FormGroup>
                <Label>
                    {label}
                    {subLabel &&
                    <FormText color="muted">{subLabel}</FormText>
                    }
                </Label>
                <BSInput 
                    className="leaf-input"
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    readOnly={locked}
                    spellCheck={false}
                    type={t}
                    value={val} />
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

    private handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { changeHandler, propName } = this.props;
        const newVal = e.currentTarget.value;
        changeHandler(newVal, propName);
    };
};
