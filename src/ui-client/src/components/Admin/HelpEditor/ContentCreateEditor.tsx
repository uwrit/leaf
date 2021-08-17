/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from 'reactstrap';
import { CreateRow } from '../../../models/admin/Help';
import './ContentCreateEditor.css';


interface Props {
    // propName?: string;
    // value?: string;
    // titleCategoryHandler?: (val: string, propName: string) => void;

    index: number;
    createRow: CreateRow;
    contentHandler: (val: string, index: number) => void;

    newSectionHandler: (index: number, text: boolean, evt?: React.ChangeEvent<HTMLInputElement>) => void;
}

interface State { }

export class ContentCreateEditor extends React.Component<Props, State> {
    private className = "content-create-editor"

    constructor(props: Props){
        super(props)
        this.state = { }
    }

    public render() {
        const c = this.className;
        const { createRow } = this.props;
        const { } = this.state;

        return (
            <div className={c}>
                
                {/* <div>
                    <TextareaAutosize value={value} onChange={this.handleTitleCategoryChange} />
                </div> */}

                {/* <div>
                    {createRow &&
                       <TextareaAutosize value={createRow!.textContent} onChange={this.handleContentChange} />
                    }
                </div> */}

                <div className={`${c}-row`}>
                    <div className={'hover-button'}>
                        <Button>
                            <label htmlFor={`${createRow.id}-above`}>
                                <span>Add Image/Gif Above</span>
                                <input id={`${createRow.id}-above`} type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, true, false)}/>
                            </label>
                        </Button>

                        <Button>
                            <label htmlFor={`${createRow.id}-below`}>
                                <span>Add Image/Gif Below</span>
                                <input id={`${createRow.id}-below`} type="file" accept="image/*" style={{display: "none"}} onChange={this.handleNewSection.bind(null, false, false)}/>
                            </label>
                        </Button>

                        <Button onClick={this.handleNewSection.bind(null, true, true)}>Add Text Above</Button>
                        <Button onClick={this.handleNewSection.bind(null, false, true)}>Add Text Below</Button>
                    </div>

                    {createRow.imageContent
                        ? <img src={`data:image;base64,${createRow.imageContent}`} />
                        : <TextareaAutosize value={createRow.textContent} onChange={this.handleContentChange} />
                    }
                </div>

            </div>


        );
    };

    // private handleTitleCategoryChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     const { propName, titleCategoryHandler } = this.props;
    //     const newVal = e.currentTarget.value;
        
    //     titleCategoryHandler!(newVal, propName!);
    // };

    private handleNewSection = (above: boolean, text: boolean, event?: any) => {
        const { index, newSectionHandler } = this.props;
        const updatedIndex = above ? index : index+1;

        newSectionHandler(updatedIndex, text, event);
    };

    private handleContentChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { contentHandler, index } = this.props;
        const newVal = e.currentTarget.value;

        contentHandler!(newVal, index!);
    };
}