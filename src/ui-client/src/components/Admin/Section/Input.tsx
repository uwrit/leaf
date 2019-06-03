/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Input as BSInput, Label, FormText } from 'reactstrap';
import { PropertyProps as Props } from '../ConceptEditor/Props';

interface State {
    valid: boolean;
}

export class Input extends React.PureComponent<Props,State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            valid: true
        }
    }

    public render() {
        const { label, subLabel, locked, type, value, placeholder, required } = this.props;
        const { valid } = this.state;
        const classes = [ 'leaf-input' ];
        let t = type || 'string' as any;
        let val = value || '';

        if (!valid) {
            classes.push('error');
        }

        return (
            <FormGroup>
                <Label>
                    {label}
                    {required &&
                    <span className='required'>*</span>
                    }
                    {subLabel &&
                    <FormText color="muted">{subLabel}</FormText>
                    }
                </Label>
                <BSInput 
                    className={classes.join(' ')}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    placeholder={placeholder}
                    readOnly={locked}
                    spellCheck={false}
                    type={t}
                    value={val} />
            </FormGroup>
        );
    }

    private handleBlur = () => {
        const { focusToggle, required, value } = this.props;
        if (focusToggle) { focusToggle(false); }
        if (required && !value) {
            this.setState({ valid: false });
        }
    }

    private handleFocus = () => {
        const { focusToggle } = this.props;
        if (focusToggle) { focusToggle(true); }
    }

    private handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { changeHandler, propName, required } = this.props;
        const newVal = e.currentTarget.value;
        changeHandler(newVal, propName);
        if (required) {
            this.setState({ valid: !!newVal });
        }
    };
};
