/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Label, FormText, Input } from 'reactstrap';
import { setNoteSearchTerms, searchNotesByTerms } from '../../../actions/cohort/noteSearch';
import './SearchTermEditor.css';

interface Props {
    dispatch: any;
    terms: string[];
}

interface State {
    text: string;
}

export class SearchTermEditor extends React.PureComponent<Props,State> {
    private className = 'note-search-term-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            text: ''
        }
    }

    public render() {
        const { terms } = this.props;
        const { text } = this.state;
        const c = this.className;

        return (
            <FormGroup className={c}>
                <Label>
                    Search Terms
                    <FormText color="muted">Enter terms to look for in notes. Type 'enter', or 'tab' to add a term.</FormText>
                </Label>
                <div className={`${c}-term-container`}>
                {terms.map((t,i) => {
                    return (
                        <div className={`${c}-term`} key={i} onClick={this.handleRemoveTermClick.bind(null,i)}>
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
                />
        </FormGroup>
        );
    }

    private handleKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { dispatch, terms } = this.props;
        const { text } = this.state;
        const trimmed = text.trim();

        switch (k.key) {
            case 'Tab':
            case 'Enter': {
                if (trimmed.length) {
                    k.preventDefault();
                    dispatch(setNoteSearchTerms(terms.concat([trimmed])));
                    dispatch(searchNotesByTerms());
                    this.setState({ text: '' });
                }
                return;
            }
            case 'Backspace': {
                if (!trimmed.length && terms.length) {
                    const newTerms = terms.slice();
                    newTerms.pop();
                    dispatch(setNoteSearchTerms(newTerms));
                    dispatch(searchNotesByTerms());
                }
                return;
            }
        }
    }

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.currentTarget.value;
        this.setState({ text: newVal });
    };

    private handleRemoveTermClick = (idx: number) => {
        const { dispatch, terms } = this.props;
        const newTerms = terms.slice();
        newTerms.splice(idx,1);
        dispatch(setNoteSearchTerms(newTerms));
        dispatch(searchNotesByTerms());
    }
};
