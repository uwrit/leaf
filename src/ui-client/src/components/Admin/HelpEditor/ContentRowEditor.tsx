/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Col, Input, InputGroup, InputGroupText, Row } from 'reactstrap';
import { ContentRow } from '../../../models/admin/Help';
import { FaSortAlphaUp, FaSortAlphaDown, FaRegImage, FaRegWindowClose, FaAngleDoubleUp, FaAngleDoubleDown } from 'react-icons/fa';
import { MdTextFields } from 'react-icons/md';
import './ContentRowEditor.css';

import { generate as generateId } from 'shortid';

// TODO: need to delete idyll component (does not work as expected)
import * as components from 'idyll-components';
import IdyllDocument from 'idyll-document';

interface Props {
    dispatch: any;
    contentRow: ContentRow;
    index: number;
    contentHandler: (val: string, index: number) => void;
    newSectionHandler: (index: number, pageId: string, text: boolean, evt?: React.ChangeEvent<HTMLInputElement>) => void;
    imageSizeHandler: (val: number, index: number) => void;
    deleteRowHandler: (index: number) => void;
}

interface State {
    selected: boolean;
}

export class ContentRowEditor extends React.Component<Props, State> {
    private className = "content-row-editor";
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
        if (textEditRowElement && textEditRowElement[0]) {
            textEditRowElement[0].focus()
            textEditRowElement[0].selectionStart = textEditRowElement[0].value.length;
        };
    };

    public render() {
        const c = this.className;

        return (
            <div className={`${c}-container`}>
                <Row>
                    <Col md={12}>
                        {this.getContent()}
                    </Col>
                </Row>
            </div>
        );
    };

    private getContent = () => {
        const c = this.className;
        const { contentRow } = this.props;
        const { selected } = this.state;

        if (contentRow.textContent) {
            if (!selected) {
                return (
                    <div className={`${c}-markdown`} onClick={this.handleClick}>
                        {this.getEditButtons()}

                        <ReactMarkdown children={contentRow.textContent} />
                    </div>
                );
            } else {
                return (
                    <div className={`${c}-markdown`}>                   
                        <TextareaAutosize
                            className={this.textEditorClassName}
                            onBlur={this.handleBlur}
                            onChange={this.handleChange}
                            value={contentRow.textContent}
                        />
                    </div>
                );
            }
        } else if (contentRow.imageContent) {
            return (
                <div className={`${c}-markdown` }>
                    {this.getEditButtons()}

                    <img
                        alt={contentRow.imageId}
                        src={`data:image;base64,${contentRow.imageContent}`}
                        style={{marginBottom: "10px", maxWidth: `${contentRow.imageSize}%`}}
                    />
                    {/* caption: <div>random text below</div> */}
                </div>
            );
        };
        return ;
    };

    private getEditButtons = () => {
        const { contentRow } = this.props;
        return (
            <div className={'edit-buttons'}>
                <FaRegWindowClose className={'edit-button'} onClick={this.deleteRow} />
                <FaAngleDoubleUp className={'edit-button'} style={{cursor: "default"}} />
                <MdTextFields className={'edit-button'} onClick={this.handleNewSection.bind(null, true, true)}/>
                <label htmlFor={`${contentRow.id}-above`} style={{cursor: "pointer"}}>
                    <FaRegImage className={'edit-button'} />
                    <input id={`${contentRow.id}-above`} type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, true, false)}/>
                </label>
                <label htmlFor={`${contentRow.id}-below`} style={{cursor: "pointer"}}>
                    <FaRegImage className={'edit-button'} />
                    <input id={`${contentRow.id}-below`} type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, false, false)}/>
                </label>
                <MdTextFields className={'edit-button'} style={{marginTop: "-13px"}} onClick={this.handleNewSection.bind(null, false, true)}/>
                <FaAngleDoubleDown className={'edit-button'} style={{cursor: "default"}} />

                {contentRow.imageContent && <Input className={'edit-button image-size'} type="number" onChange={this.imageSizeChange} min={40} value={contentRow.imageSize} />}
            </div>
        );
    };

    private handleBlur = () => { this.setState({ selected: false }) };

    private handleClick = () => { this.setState({ selected: true }) };

    private handleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { contentHandler, index } = this.props;
        const newVal = e.currentTarget.value;
        contentHandler(newVal, index);
    };    

    private handleNewSection = (above: boolean, text: boolean, evt?: any) => {
        const { contentRow, index, newSectionHandler } = this.props;
        const pageId = contentRow.pageId;
        const updatedIndex = above ? index : index+1;

        newSectionHandler(updatedIndex, pageId, text, evt);
        this.setState({ selected: false });
    };

    private imageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { imageSizeHandler, index } = this.props;
        const newImageSize = e.currentTarget.valueAsNumber;
        imageSizeHandler(newImageSize, index);
    };

    private deleteRow = () => {
        const { deleteRowHandler, index } = this.props;
        deleteRowHandler(index);
    };
}