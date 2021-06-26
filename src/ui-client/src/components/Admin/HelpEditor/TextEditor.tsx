/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button, Col, Row } from 'reactstrap';
import TextareaAutosize from 'react-textarea-autosize';
import './TextEditor.css';

interface Props {
    text: string;
    category?: boolean;
    textHandler: (text: string) => void;
    unsaved: boolean;
}

interface State {
    selected: boolean;
}

export class TextEditor extends React.Component<Props, State> {
    private className = "text-editor"

    constructor(props: Props){
        super(props)
        this.state = {
            selected: false
        }
    }

    public render() {
        const c = this.className;
        const { category, text } = this.props;
        const { selected } = this.state;
        const markdownText = selected ? 'markdown-slide-left' : 'markdown';
        const markdownEdit = selected ? 'text-edit' : 'text';

        return (
            <div className={c}>
                <Row>

                    <Col>
                        <div className={`${c}-${markdownText}`} onClick={this.handleClick}>
                            <ReactMarkdown children={category ? `Category: ${text}` : text} />
                        </div>
                    </Col>

                    <Col>
                        <div className={`${c}-${markdownEdit}`}>
                            <div className={'hover-button'}>
                                {this.props.unsaved && <Button>Unsaved</Button>}
                            </div>

                            <TextareaAutosize
                                onChange={this.handleChange}
                                value={text}
                            />
                        </div>
                    </Col>

                </Row>
            </div>
        );
    };

    private handleClick = () => {
        this.setState({
            selected: true
        });
    };

    private handleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { textHandler } = this.props;
        const newText = e.currentTarget.value;

        textHandler(newText);
    };
}