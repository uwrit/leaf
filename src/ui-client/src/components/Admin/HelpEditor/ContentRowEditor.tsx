/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Col, Input, Row } from 'reactstrap';
import { ContentRow } from '../../../models/admin/Help';
import { FaSortAlphaUp, FaSortAlphaDown, FaRegImage, FaRegWindowClose, FaAngleDoubleUp, FaAngleDoubleDown } from 'react-icons/fa';
import { MdTextFields } from 'react-icons/md';
import './ContentRowEditor.css';

import * as components from 'idyll-components';
import IdyllDocument from 'idyll-document';

interface Props {
    dispatch: any;
    contentRow: ContentRow;
    index: number;
    contentHandler: (val: string, index: number) => void;
    newSectionHandler: (index: number, pageId: string, text: boolean, evt?: React.ChangeEvent<HTMLInputElement>) => void;
    imageSizeHandler: (val: number, index: number) => void;
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
                        {/* {this.editContent()} */}
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
            // return (
            //     <div className={`${c}-markdown`} onClick={this.handleClick}>
            //         <ReactMarkdown children={contentRow.textContent} />
            //     </div>
            // );

            // START TEST FEATURE
            if (selected) { //replace true with selected when css figured out
                return (
                    <div className={`${c} ${selected ? "editing" : ""}`}>
                        <div className={'text-edit-buttons'}>
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
            } else {
                return (
                    <div className={`${c}-markdown`} onClick={this.handleClick}>
                        <ReactMarkdown children={contentRow.textContent} />
                    </div>
                );
            }
            // END TEST FEATURE

        } else if (contentRow.imageContent) {
            return (
                
                <div className={`${c}-markdown` }>
                    
                    <div className={'image-edit-buttons'}>

                        {/* <Button onClick={this.deleteImage}>X</Button> */}
                        <FaRegWindowClose className={'image-edit-button'} onClick={this.deleteImage} />
                        
                        <FaAngleDoubleUp className={'image-edit-button'} style={{cursor: "default"}} />
                        
                        {/* <Button onClick={this.handleNewSection.bind(null, true, true)}>Add Text Above</Button> */}
                        <MdTextFields className={'image-edit-button'} onClick={this.handleNewSection.bind(null, true, true)}/>
                        
                        
                        {/* <Button> */}
                            <label htmlFor={`${contentRow.id}-above`} style={{cursor: "pointer", marginBottom: 0}}>
                                <FaRegImage className={'image-edit-button'} />
                                <input id={`${contentRow.id}-above`} type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, true, false)}/>
                            </label>
                        {/* </Button> */}

                        {/* <Button> */}
                            <label htmlFor={`${contentRow.id}-below`} style={{cursor: "pointer", backgroundColor:"red"}}>
                            {/* <label htmlFor={`${contentRow.id}-below`} style={{cursor: "pointer"}}> */}
                                <FaRegImage className={'image-edit-button'} />
                                <input id={`${contentRow.id}-below`} type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, false, false)}/>
                            </label>
                        {/* </Button> */}
                        
                        {/* <Button onClick={this.handleNewSection.bind(null, false, true)}>Add Text Below</Button> */}
                        <MdTextFields className={'image-edit-button'} onClick={this.handleNewSection.bind(null, false, true)}/>
                        
                        <Input type="number" onChange={this.imageSizeChange} value={contentRow.imageSize} />

                        <FaAngleDoubleDown className={'image-edit-button'} style={{cursor: "default"}} />
                    </div>

                    <img
                        src={`data:image;base64,${contentRow.imageContent}`}
                        alt={contentRow.imageId}
                        style={{marginBottom: "10px", maxWidth: `${contentRow.imageSize}%`}}
                        // edit maxWidth and make it a variable
                    />
                    {/* <div>
                        random text below
                    </div> */}
                </div>
            );
        };
        return ;
    };

    private editContent = () => {
        const c = this.className;
        const { contentRow } = this.props;
        const { selected } = this.state;

        return (
            <div className={`${c} ${selected ? "editing" : ""}`}>
                <div className={'text-edit-buttons'}>
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

    private imageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { imageSizeHandler, index } = this.props;
        const newImageSize = e.currentTarget.valueAsNumber;
        imageSizeHandler(newImageSize, index);
    };

    private deleteImage = () => {
        const { deleteImageHandler, index } = this.props;
        deleteImageHandler(index);
    };

}