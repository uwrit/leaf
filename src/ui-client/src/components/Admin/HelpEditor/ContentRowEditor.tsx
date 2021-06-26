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
import { Button, Col, Row, Input } from 'reactstrap';
import { HelpPage, HelpPageContent } from '../../../models/Help/Help';
import TextareaAutosize from 'react-textarea-autosize';
import './ContentRowEditor.css';
import { TextArea } from '../Section/TextArea';
// import { setAdminHelpContent } from '../../../actions/admin/helpPage';
import { ContentRow, UpdateHelpPageContent, UpdateHelpPageContentDTO } from '../../../models/admin/Help';
// import { AdminHelpContentState } from '../../../models/state/AdminHelpState';

interface Props {
    contentRow: ContentRow;

    dispatch: any;

    category: string;
    title: string;

    im: string;

    contentHandler: (val: string, orderId: number) => void;
    newSectionHandler: (contentRow: ContentRow, above: boolean) => void;
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

        return (
            <div className={c}>
                <Row>

                    <Col>
                        <div className={`${c}-${markdownText}`} onClick={this.handleClick}>
                            {/* <ReactMarkdown children={cont} /> */}
                            
                            {this.props.contentRow.imageContent &&
                                <ReactMarkdown
                                    children={`![text](${contentRow.imageContent})`}
                                />
                            }
                            
                            <ReactMarkdown children={contentRow.textContent} />
                            {/* <img src={this.props.im}/> */}
                        </div>
                    </Col>

                    <Col>
                        <div className={`${c}-${markdownEdit}`}>
                            <div className={'hover-button'}>
                                <Button onClick={this.handleAddSectionAbove}>Add Section Above</Button>
                                <Button onClick={this.handleAddSectionBelow}>Add Section Below</Button>
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

    private handleAddSectionAbove = () => {
        const { contentRow } = this.props;
        this.props.newSectionHandler(contentRow, true);
        this.setState({ selected: false });
    };

    private handleAddSectionBelow = () => {
        const { contentRow } = this.props;
        this.props.newSectionHandler(contentRow, false);
        this.setState({ selected: false });
    };

    private handleClick = () => {
        this.setState({
            selected: true
        });
    };

    private handleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { contentRow, contentHandler } = this.props;
        const newVal = e.currentTarget.value;
        contentHandler(newVal, contentRow.orderId);
    };
}