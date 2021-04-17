/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Col, Row } from 'reactstrap';
import { HelpPage, HelpPageContent } from '../../../models/Help/Help';
import TextareaAutosize from 'react-textarea-autosize';
import './ContentEditor.css';

interface Props {
    content: HelpPageContent;
    currentPage: HelpPage;
    dispatch: any;
}

interface State {
    selected: boolean;
    newContent: string;
}

export class ContentEditor extends React.Component<Props, State> {
    private className = "content-editor"

    constructor(props: Props){
        super(props)
        this.state = {
            selected: false,
            newContent: this.props.content.textContent
        }
    }

    public render() {
        const c = this.className;
        const { content, currentPage, dispatch } = this.props;
        const { newContent, selected } = this.state;
        const markdownClass = selected ? 'markdown-slide-left' : 'markdown';
        const col1Size = selected ? 6 : 12;
        const col2Size = selected ? 6 : 0;

        // if (selected) {
        //     return (
        //         <div>
        //             <Row>
        //             {/* <Col className={`${c}-left`}>
        //                 <ReactMarkdown  className={`${c}-markdown`} children={newContent} />
        //             </Col> */}

        //             <Col>
        //                 <TextareaAutosize
        //                     className={`${c}-edit-row`}
        //                     onChange={this.handleChange}>
        //                     {newContent}
        //                 </TextareaAutosize>
        //             </Col>
        //             </Row>
        //             <button onClick={this.handleSaveClick}>
        //                 SAVE
        //             </button>
        //         </div>
        //     );
        // };

        return (
            <div className={c}>

                <Row>

                    <Col xs={col1Size}>
                        <div className={`${c}-${markdownClass}`} onClick={this.handleClick}>
                            <ReactMarkdown children={newContent} />
                        </div>
                    </Col>

                    <Col xs={col2Size}>
                        {selected &&
                            <div className={`${c}-text-edit`}>
                                <TextareaAutosize
                                    // className={`${c}-edit-row`}
                                    onChange={this.handleChange}>
                                        {newContent}
                                </TextareaAutosize>

                                {/* <button onClick={this.handleSaveClick}>
                                    SAVE
                                </button> */}
                            </div>
                        }
                    </Col>

                </Row>
                
            </div>
        );
    };

    private handleSaveClick = () => {
        const selected = this.state.selected;
        this.setState({
            selected: !selected
        })
    };

    private handleClick = () => {
        const selected = this.state.selected;
        this.setState({
            selected: !selected
        })
    };

    private handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({
            newContent: e.currentTarget.value
        })
    };
}