/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Row } from 'reactstrap';
import { generate as generateId } from 'shortid';
import TextareaAutosize from 'react-textarea-autosize';
import './TextEditor.css';

interface Props {
    text: string;
    textHandler: (val: string, propName: string) => void;
}

interface State {
    selected: boolean;
}

export class TextEditor extends React.Component<Props, State> {
    private className = "text-editor";
    private focused = false;
    private textEditorClassName = "";

    constructor(props: Props){
        super(props)
        this.state = {
            selected: false
        }
    };

    public componentDidMount() {
        this.textEditorClassName = `${this.className}-markdown-text-edit-${generateId()}`;
    };

    public componentDidUpdate() {
        const textEditRowElement: any = document.getElementsByClassName(`${this.textEditorClassName}`);

        // When text row is clicked, textarea already has focus and sets cursor to end of text.
        if (textEditRowElement && textEditRowElement[0] && !this.focused) {
            textEditRowElement[0].focus()
            textEditRowElement[0].selectionStart = textEditRowElement[0].value.length;
            
            this.focused = true;
        };
        // FIX: find a better solution than focused.
    };

    public render() {
        const c = this.className;

        return (
            <div className={`${c}-container`}>
                <Row>
                    <Col>
                        {this.getContent()}
                    </Col>
                </Row>
            </div>
        );
    };

    private getContent = () => {
        const c = this.className;
        const { text } = this.props;
        const { selected } = this.state;

        if (!selected) {
            return (
                <div className={`${c}-markdown`} onClick={this.handleClick}>
                    {text}
                </div>
            );
        } else {
            return (
                <div className={`${c}-markdown`}>
                    <TextareaAutosize
                        className={this.textEditorClassName}
                        onBlur={this.handleBlur}
                        onChange={this.handleChange}
                        value={text}
                    />
                </div>
            );
        };
    };

    private handleBlur = () => { this.focused = false; this.setState({ selected: false }) };

    private handleClick = () => { this.setState({ selected: true }) };

    private handleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { textHandler } = this.props;
        const propName = 'title';
        const newVal = e.currentTarget.value;
        
        textHandler(newVal, propName);
    };
}