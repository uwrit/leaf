/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Col, Row } from 'reactstrap';
import { ContentRow } from '../../../models/admin/Help';
import './ContentRowEditor.css';

import * as components from 'idyll-components';
import IdyllDocument from 'idyll-document';

interface Props {
    dispatch: any;
    contentRow: ContentRow;
    index: number;
    contentHandler: (val: string, index: number) => void;
    newSectionHandler: (index: number, pageId: string, text: boolean, evt?: React.ChangeEvent<HTMLInputElement>) => void;
    deleteImageHandler: (index: number) => void;
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

        return (
            <div className={`${c}-container`}>
                <Row>
                    <Col md={12}>
                        {this.getContent()}
                        {this.editContent()}
                    </Col>
                </Row>
            </div>
        );
    };

    private editContent = () => {
        const c = this.className;
        const { contentRow } = this.props;
        const { selected } = this.state;

        return (
            <div className={`${c} ${selected ? "editing" : ""}`}>
                <div className={'hover-button'}>
                    <Button>
                        <label htmlFor={`${contentRow.id}-above`}>
                            <span>Add Image/Gif Above</span>
                            <input id={`${contentRow.id}-above`} type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, true, false)}/>
                        </label>
                    </Button>

                    <Button>
                        <label htmlFor={`${contentRow.id}-below`}>
                            <span>Add Image/Gif Below</span>
                            <input id={`${contentRow.id}-below`} type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, false, false)}/>
                        </label>
                    </Button>

                    <Button onClick={this.handleNewSection.bind(null, true, true)}>Add Text Above</Button>
                    <Button onClick={this.handleNewSection.bind(null, false, true)}>Add Text Below</Button>
                </div>
                
                <TextareaAutosize
                    onChange={this.handleChange}
                    value={contentRow.textContent}
                    onBlur={this.handleBlur}
                />
            </div>
        );
    };

    private getContent = () => {
        const c = this.className;
        const { contentRow } = this.props;
        const { selected } = this.state;

        if (contentRow.textContent) {
            return (
                <div className={`${c}-markdown`} onClick={this.handleClick}>
                    <ReactMarkdown children={contentRow.textContent} />
                </div>
            );

        } else if (contentRow.imageContent) {
            return (
                
                <div className={`${c}-markdown image-edit` }>
                    
                    <div className={'image-edit-buttons'}>
                        <Button>
                            <label htmlFor={`${contentRow.id}-above`}>
                                <span>Add Image/Gif Above</span>
                                <input id={`${contentRow.id}-above`} type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, true, false)}/>
                            </label>
                        </Button>

                        <Button>
                            <label htmlFor={`${contentRow.id}-below`}>
                                <span>Add Image/Gif Below</span>
                                <input id={`${contentRow.id}-below`} type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, false, false)}/>
                            </label>
                        </Button>

                        <Button onClick={this.handleNewSection.bind(null, true, true)}>Add Text Above</Button>
                        <Button onClick={this.handleNewSection.bind(null, false, true)}>Add Text Below</Button>

                        <Button onClick={this.deleteImage}>X</Button>
                    </div>

                    <img
                        src={`data:image;base64,${contentRow.imageContent}`}
                        alt={contentRow.imageId}
                        style={{marginBottom: "10px"}}
                    />
                </div>
            );
        };
        return ;
    };

    private handleNewSection = (above: boolean, text: boolean, evt?: any) => {
        const { contentRow, index, newSectionHandler } = this.props;
        const pageId = contentRow.pageId;
        const updatedIndex = above ? index : index+1;

        newSectionHandler(updatedIndex, pageId, text, evt);
        this.setState({ selected: false });
    };

    private handleClick = () => { this.setState({ selected: true }) };

    private handleBlur = () => { this.setState({ selected: false }) };

    private handleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { contentHandler, index } = this.props;
        const newVal = e.currentTarget.value;
        contentHandler(newVal, index);
    };

    private deleteImage = () => {
        const { deleteImageHandler, index } = this.props;
        deleteImageHandler(index);
    };

}