/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Label, FormText, Input } from 'reactstrap';
import './Tagger.css';

interface Props {
    changeHandler: (val: any, propName: string) => any;
    locked?: boolean;
    propName: string;
    tags: string[];
}

interface State {
    text: string;
}

export class Tagger extends React.PureComponent<Props,State> {
    private className = 'dataset-editor-tagger';
    constructor(props: Props) {
        super(props);
        this.state = {
            text: ''
        }
    }

    public render() {
        const { locked, tags } = this.props;
        const { text } = this.state;
        const c = this.className;

        return (
            <FormGroup className={c}>
                <Label>
                    Tags
                    <FormText color="muted">Tags are additional search terms that can be associated with this dataset. Type your tag text and hit 'space', 'enter', or 'tab' to add it.</FormText>
                </Label>
                <div className={`${c}-tag-container`}>
                {tags.map((t,i) => {
                    return (
                        <div className={`${c}-tag`} key={i} onClick={this.handleRemoveTagClick.bind(null,i)}>
                            {t}
                            <span>x</span>
                        </div>
                    )
                })}
                </div>
                <Input 
                    className={`${c}-input leaf-input`} 
                    value={text} 
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeydown}
                    disabled={locked}
                />
        </FormGroup>
        );
    }

    private handleKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { changeHandler, propName, tags, locked } = this.props;
        const { text } = this.state;
        const trimmed = text.trim();

        if (locked) { return; }

        switch (k.key) {
            case ' ':
            case 'Tab':
            case 'Enter': {
                if (trimmed.length) {
                    k.preventDefault();
                    changeHandler(tags.concat([trimmed]), propName);
                    this.setState({ text: '' });
                }
                return;
            }
            case 'Backspace': {
                if (!trimmed.length && tags.length) {
                    const newTags = tags.slice();
                    newTags.pop();
                    changeHandler(newTags, propName);
                }
                return;
            }
        }
    }

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { locked } = this.props;
        if (locked) { return; }
        const newVal = e.currentTarget.value;
        this.setState({ text: newVal });
    };

    private handleRemoveTagClick = (idx: number) => {
        const { changeHandler, propName, tags, locked } = this.props;
        const newTags = tags.slice();
        if (locked) { return; }
        newTags.splice(idx,1);
        changeHandler(newTags, propName);
    }
};
