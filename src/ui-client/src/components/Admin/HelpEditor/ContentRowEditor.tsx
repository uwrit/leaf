/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { MdTextFields } from 'react-icons/md';
import { Button, Col, Row, Input, Navbar, NavItem } from 'reactstrap';
import { HelpPage, HelpPageContent } from '../../../models/Help/Help';
import TextareaAutosize from 'react-textarea-autosize';
import './ContentRowEditor.css';
import { TextArea } from '../Section/TextArea';

import { ContentRow, UpdateHelpPageContent, UpdateHelpPageContentDTO } from '../../../models/admin/Help';

interface Props {
    contentRow: ContentRow;

    dispatch: any;

    category: string;
    title: string;

    contentHandler: (val: string, orderId: number, index: number) => void;
    // newTextSectionHandler: (index: number, contentRow: ContentRow, above: boolean) => void;
    // newImageSectionHandler: (evt: React.ChangeEvent<HTMLInputElement>, index: number, ContentRow: ContentRow) => void;
    newSectionHandler: (index: number, contentRow: ContentRow, text: boolean, evt?: React.ChangeEvent<HTMLInputElement>) => void;

    index: number;
}

interface State {
    selected: boolean;
}

export class ContentRowEditor extends React.Component<Props, State> {
    private className = "content-row-editor"

    constructor(props: Props){
        super(props)
        this.state = {
            selected: false
        }
    }

    public render() {
        const c = this.className;
        const { contentRow } = this.props;
        const { selected } = this.state;
        const markdownText = selected ? 'markdown-slide-left' : 'markdown';
        const markdownEdit = selected ? 'text-edit' : 'text';

        // console.log(contentRow)
        return (
            <div className={c}>
                <Row>

                    <Col>
                        <div className={`${c}-${markdownText}`} onClick={this.handleClick}>
                            {/* <ReactMarkdown children={cont} /> */}
                            {/* {console.log(contentRow.imageContent)} */}
                            {this.props.contentRow.imageContent &&
                                <img src={`data:image;base64,${contentRow.imageContent}`} />
                            }
                            
                            <ReactMarkdown children={contentRow.textContent} />
                            {/* <img src={this.props.im}/> */}
                        </div>
                    </Col>

                    <Col>
                        <div className={`${c}-${markdownEdit}`}>
                            <div className={'hover-button'}>
                                {/* <Button onClick={this.handleAddSectionAbove}>Add Section Above</Button>
                                <Button onClick={this.handleAddSectionBelow}>Add Section Below</Button> */}

                                <Button>
                                    <label htmlFor="above">
                                        <span>Add Image/Gif Above</span>
                                        <input id="above" type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, true, false)}/>
                                    </label>
                                </Button>

                                <Button>
                                    <label htmlFor="below">
                                        <span>Add Image/Gif Below</span>
                                        <input id="below" type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, false, false)}/>
                                    </label>
                                </Button>

                                {/* <Button onClick={this.handleAddSectionAbove}>Add Text Above</Button>
                                <Button onClick={this.handleAddSectionBelow}>Add Text Below</Button> */}
                                <Button onClick={this.handleNewSection.bind(null, true, true)}>Add Text Above</Button>
                                <Button onClick={this.handleNewSection.bind(null, false, true)}>Add Text Below</Button>
                            </div>

                            <TextareaAutosize
                                onChange={this.handleChange}
                                // value={cont}
                                value={contentRow.textContent}
                            />
                        </div>
                    </Col>

                </Row>
            </div>
        );
    };

    private handleNewSection = (above: boolean, text: boolean, e?: any) => {
        const { contentRow, index, newSectionHandler } = this.props;
        const currIndex = above ? index : index+1;
        newSectionHandler(currIndex, contentRow, text, e);
        this.setState({ selected: false });
    };

    private handleClick = () => { this.setState({ selected: true }) };

    private handleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { contentRow, contentHandler } = this.props;
        const newVal = e.currentTarget.value;
        contentHandler(newVal, contentRow.orderId, this.props.index);
    };
}