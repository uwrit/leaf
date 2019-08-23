/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Label, FormText } from 'reactstrap';
import TextareaAutosize from 'react-textarea-autosize'
import { PropertyProps } from '../ConceptEditor/Props';

interface Props extends PropertyProps {
    overrideTabKeyDown?: boolean;
}

export class TextArea extends React.PureComponent<Props> {
    public render() {
        const { className, label, subLabel, locked, value, required, onClick, forceValidation, errorText, placeholder } = this.props;
        const classes = [ 'leaf-input' ];
        const valid = !required ? true : !!value;
        let val = value || '';

        if (!valid) {
            classes.push('error');
        }

        return (
            <FormGroup>
                {label &&
                <Label>
                    {label}
                    {required &&
                    <span className='required'>*</span>
                    }
                    {subLabel &&
                    <FormText color="muted">{subLabel}</FormText>
                    }
                </Label>
                }
                <div className={className}>
                    <TextareaAutosize 
                        className={classes.join(' ')}
                        minRows={1}
                        maxRows={5}
                        onBlur={this.handleBlur}
                        onChange={this.handleChange}
                        onClick={onClick}
                        onFocus={this.handleFocus}
                        onKeyDown={this.handleKeydown}
                        placeholder={placeholder}
                        readOnly={locked}
                        spellCheck={false}
                        value={val}
                    />
                </div>
                {forceValidation && !valid && errorText &&
                <span className='validation-error'>{errorText}</span>
                }
            </FormGroup>
        );
    }

    private handleKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { changeHandler, propName, value, overrideTabKeyDown } = this.props;
        if (k.key !== 'Tab' || !overrideTabKeyDown) { return; }
        k.preventDefault();
        const tabbed = '    ';
        const newVal = value ? value + tabbed : tabbed;
        changeHandler(newVal, propName);
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

    private handleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { changeHandler, propName } = this.props;
        const newVal = e.currentTarget.value;
        changeHandler(newVal, propName);
    };
};
