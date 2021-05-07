/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button, Col, Row } from 'reactstrap';
import { HelpPage, HelpPageContent } from '../../../models/Help/Help';
import TextareaAutosize from 'react-textarea-autosize';
import './ContentEditor.css';
import { TextArea } from '../Section/TextArea';

interface Props {
    content: HelpPageContent;

    // dispatch: any; Maybe need it or maybe not
    buttonDisableHandler: (disabled: boolean) => void;
}

interface State {
    selected: boolean;
    cont: string;
}

export class ContentEditor extends React.Component<Props, State> {
    private className = "content-editor"

    constructor(props: Props){
        super(props)
        this.state = {
            selected: false,
            cont: this.props.content.textContent
        }
    }

    public render() {
        const c = this.className;
        // const { content, currentPage, dispatch } = this.props;
        const { cont, selected } = this.state;
        const markdownClass = selected ? 'markdown-slide-left' : 'markdown';
        const col1Size = selected ? 6 : 12;
        const col2Size = selected ? 6 : 0;

        return (
            <div className={c}>
                <Row>

                    <Col xs={col1Size}>
                        <div className={`${c}-${markdownClass}`} onClick={this.handleClick}>
                            <ReactMarkdown children={cont} />
                        </div>
                    </Col>

                    <Col xs={col2Size}>
                        {selected &&
                            <div className={`${c}-text-edit`}>
                                <TextareaAutosize onChange={this.handleChange} value={cont} />

                                <Button onClick={this.handleUndo}>UNDO</Button>
                                {/* NIC: why does the changeHandler function work still? function is missing param */}
                                {/* <TextArea
                                    className={`${c}-edit-row`}
                                    changeHandler={this.changeHandler}
                                    value={newContent}
                                    propName={content.id.toString()}
                                /> */}

                            </div>
                        }
                    </Col>

                </Row>
            </div>
        );
    };

    private handleUndo = () => {
        this.setState({
            cont: this.props.content.textContent
        })
    };

    private handleClick = () => {
        // const selected = this.state.selected;
        this.setState({
            // selected: !selected
            selected: true
        });
        this.props.buttonDisableHandler(true);
    };

    private handleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        this.setState({
            cont: e.currentTarget.value,
        })
    };

    private changeHandler = (val: any) => {
        this.setState({
            cont: val
        })
    };
}