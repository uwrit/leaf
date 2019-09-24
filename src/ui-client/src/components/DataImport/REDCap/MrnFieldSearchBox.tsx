/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { REDCapImportState } from '../../../models/state/Import';
import { REDCapFieldMetadata } from '../../../models/redcapApi/Metadata';
import { FormGroup, Label, Input } from 'reactstrap';
import { keys } from '../../../models/Keyboard';
import { setImportRedcapMrnField } from '../../../actions/dataImport';

interface Props {
    dispatch: any;
    mrnFieldChangeHandler: (text: string) => void;
    redCap: REDCapImportState;
}

interface State {
    display: REDCapFieldMetadata[];
    focused: boolean;
    selected: number;
}

export default class MrnFieldSearchBox extends React.PureComponent<Props, State> {
    private className = 'import-redcap';
    private displayLimit = 5;

    constructor(props: Props) {
        super(props);
        this.state = {
            display: props.redCap.config!.metadata.slice(0, this.displayLimit),
            focused: false,
            selected: -1
        }
    }

    public render() {
        const c = this.className;
        const { redCap } = this.props;
        const { display, focused, selected } = this.state;
        const optClass = `${c}-mrn-field-option`;

        return (
            <div className={`${c}-input ${c}-mrn-field-container`}>

                {/* Input field */}
                <FormGroup>
                    <Label>MRN field</Label>
                    <Input
                        className='leaf-input'
                        type="text" 
                        onChange={this.handleMrnFieldChange} 
                        onFocus={this.handleInputFocus}
                        onBlur={this.handleInputBlur}
                        onKeyDown={this.handleSearchKeydown}
                        placeholder={'Enter MRN field...'}
                        spellCheck={false}
                        value={redCap.mrnField} />
                </FormGroup>

                {/* Suggestions */}
                {focused &&
                <div className={`${optClass}-container`}>
                    {display.map((opt, i: number) => {
                        const classes = [ 'leaf-dropdown-item', optClass ];
                        if (i === selected) {
                            classes.push('selected')
                        }

                        return (
                            <div className={classes.join(' ')} key={opt.field_name}>
                                {opt.field_label}
                                <span>{opt.field_name}</span>
                            </div>);
                        }
                    )}
                </div>
                }
            </div>
        )
    }

    /*
     * Set the focus to true, showing suggestions.
     */
    private handleInputFocus = () => this.setState({ focused: true });

    /*
     * Set the focus to false, hiding suggestions.
     */
    private handleInputBlur = () => this.setState({ focused: false });

    /*
     * Handle changes to the Mrn input field. This triggers a 
     * new search for suggestions.
     */
    private handleMrnFieldChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { mrnFieldChangeHandler, redCap } = this.props;
        const text = e.currentTarget.value;
        const newDisplay = redCap.config!.metadata
            .filter(f => f.field_name.startsWith(text) || f.field_label.startsWith(text))
            .slice(0, this.displayLimit);

        mrnFieldChangeHandler(text);
        this.setState({ display: newDisplay, selected: 0, focused: true });
    }

    /*
     * Handle keydowns if up/down/enter.
     */
    private handleSearchKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const key = (k.key === ' ' ? keys.Space : keys[k.key as any]);

        switch (key) {
            case keys.ArrowUp: 
            case keys.ArrowDown:
                this.handleArrowUpDownKeyPress(key);
                k.preventDefault();
                break;
            case keys.Enter:
                this.handleEnterKeyPress();
                break;
        }
    }

    /*
     * Handle enter presses, which sets Mrn field to currently
     * selected option.
     */
    private handleEnterKeyPress = () => {
        const { dispatch } = this.props;
        const { display, selected } = this.state;
        const focused = display[selected];

        if (focused) {
            dispatch(setImportRedcapMrnField(focused.field_name));
            this.setState({ focused: false });
        }
    }

    /*
     * Move the selected option up/down on keydown.
     */
    private handleArrowUpDownKeyPress = (key: number) => {
        const { selected, display } = this.state;

        if (display.length <= 1) {
            this.setState({ selected: 0 });
            return;
        }

        const currentFocus = selected;
        const minFocus = 0;
        const maxFocus = display.length - 1;
        const newFocus = key === keys.ArrowUp
            ? currentFocus === minFocus ? maxFocus : currentFocus - 1
            : currentFocus === maxFocus ? minFocus : currentFocus + 1;
            
        if (display[newFocus]) {
            this.setState({ selected: newFocus });
        }
        return newFocus;
    }
};