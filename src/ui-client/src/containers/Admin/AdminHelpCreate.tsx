/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from 'reactstrap';
import { createAdminHelpPageContent } from '../../actions/admin/helpPage';
import { showConfirmationModal } from '../../actions/generalUi';
import { AdminHelpCreateContent, CreateRow, CreateHelpPage, CreateHelpPageDTO } from '../../models/admin/Help';
import { ContentCreateEditor } from '../../components/Admin/HelpEditor/ContentCreateEditor';
import { ConfirmationModalState } from '../../models/state/GeneralUiState';
import { generate as generateId } from 'shortid';
import './AdminHelpCreate.css';

interface Props {
    dispatch: any;
}

interface State {
    content: AdminHelpCreateContent;
}

export class AdminHelpCreate extends React.Component<Props, State> {
    private className = "admin-help-create"

    constructor(props: Props) {
        super(props);
        
        this.state = {
            content: {
                title: 'Enter Title Here',
                category: 'Enter Category Here',
                content: [
                    {
                        id: '0',
                        orderId: 0,
                        type: 'text',
                        textContent: 'Enter Text Here',
                        imageContent: '',
                        imageId: ''
                    }
                ]
            }
        }
    }

    public render() {
        const c = this.className;
        const { dispatch } = this.props;
        const { content } = this.state;

        // TODO: make title and category on this page, user ContetnCreateEditor only for creating rows
        return (
            <div className={c}>
                <div className={`${c}-buttons`}>
                    {/* <Button className={`${c}-edit-button`} color="secondary" disabled={!disabled} onClick={this.handleUndoChanges}> */}
                    <Button className={`${c}-button`} color="secondary">
                        Undo Changes
                    </Button>

                    {/* <Button className={`${c}-edit-button`} color="success" disabled={!disabled} onClick={this.handleSaveChanges}> */}
                    <Button className={`${c}-button`} color="success" onClick={this.handleSaveChanges}>
                        Save
                    </Button>

                    {/* <Button className={`${c}-edit-button`} color="danger" disabled={disabled} onClick={this.handleDeleteContent}> */}
                    <Button className={`${c}-button`} color="danger" onClick={this.handleDeleteContent}>
                        Delete
                    </Button>
                </div>

                <div className={`${c}-title-category`}>
                    Title: <TextareaAutosize value={content.title} onChange={this.handleTitleChange} />
                </div>

                <div className={`${c}-title-category`}>
                    Category: <TextareaAutosize value={content.category} onChange={this.handleCategoryChange} />
                </div>

                {content.content.map((c, i) =>
                    <ContentCreateEditor
                        key={c.id}
                        index={i}    
                        createRow={c}
                        contentHandler={this.handleContentChange}
                        newSectionHandler={this.handleNewSection}
                    />
                )}

            </div>
        );
    };

    private handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { content } = this.state;
        const newVal = e.currentTarget.value;
        const newContent = Object.assign({}, content, { title : newVal }) as AdminHelpCreateContent;

        this.setState({ content: newContent });
    };

    private handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { content } = this.state;
        const newVal = e.currentTarget.value;
        const newContent = Object.assign({}, content, { category : newVal }) as AdminHelpCreateContent;

        this.setState({ content: newContent });
    };

    private handleContentChange = (val: string, index: number) => {
        const { content } = this.state;
        const createRowCopy = content.content.slice();
        const createRow = createRowCopy.find((_, i) => i == index);

        if (val) {
            const updatedRow = Object.assign({}, createRow, { textContent: val }) as CreateRow;
            createRowCopy.splice(index, 1, updatedRow);
        } else {
            createRowCopy.splice(index, 1);
        };

        // else if (createRowCopy.length == 1) {
        // const updatedRow = Object.assign({}, createRow, { textContent: 'Enter Text Here' }) as CreateRow;
        // createRowCopy.splice(index, 1, updatedRow);
        
        const newContent = Object.assign({}, content, { content: createRowCopy }) as AdminHelpCreateContent;
        this.setState({ content: newContent });
    };

    private handleSaveChanges = () => {
        const { dispatch } = this.props;
        const { content } = this.state;

        const createContent: CreateHelpPage[] = [];

        content.content.map(c => {
            const createdContent = {
                title: content.title,
                category: content.category,
                orderId: c.orderId,
                type: c.type,
                textContent: c.textContent,
                imageContent: c.imageContent,
                imageId: c.imageId
            } as CreateHelpPageDTO;
            createContent.push(createdContent);
        });

        dispatch(createAdminHelpPageContent(createContent));
        // this.setState({ disabled: false, unsaved: false });
    };

    private handleDeleteContent = () => {
        const { dispatch } = this.props;

        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the page? This will take effect immediately and can't be undone.`,
            header: 'Delete Page',
            onClickNo: () => null,
            // onClickYes: () => { dispatch(deleteHelpPageAndContent(currentPage)) },
            onClickYes: () => null,
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Delete Page`
        };
        dispatch(showConfirmationModal(confirm));
    }

    // new section logic
    private handleNewSection = (index: number, text: boolean, e?: React.ChangeEvent<HTMLInputElement>) => {    
        const { dispatch } = this.props;
        const { content } = this.state;
        // Make copy of current content to edit
        const contentCopy = content.content.slice();
        const uniqueId = generateId();

        if (text) {
            const con = Object.assign({}, {
                id: uniqueId,
                orderId: 0,
                type: 'text',
                textContent: 'New Section Added.',
                imageContent: '',
                imageId: ''
            }) as CreateRow;
            contentCopy.splice(index, 0, con);
            contentCopy.forEach((c,i) => c.orderId = i);
            
            const newContent = Object.assign({}, content, { content: contentCopy }) as AdminHelpCreateContent;
            // dispatch(setCurrentAdminHelpContent(newContent));

            this.setState({ content: newContent });
        } else {
            const image = e!.currentTarget.files!.item(0)!;
            const imgId = image.name;
            const reader = new FileReader();
            reader.readAsDataURL(image);

            reader.onload = () => {
                const imageString = reader.result!.toString().split(',')[1];
                const con = Object.assign({}, {
                    id: uniqueId,
                    orderId: 0,
                    type: 'image',
                    textContent: '',
                    imageContent: imageString,
                    imageId: imgId
                }) as CreateRow;

                contentCopy.splice(index, 0, con);
                contentCopy.forEach((c,i) => c.orderId = i);

                const newContent = Object.assign({}, content, { content: contentCopy }) as AdminHelpCreateContent;
                // dispatch(setCurrentAdminHelpContent(newContent));
                this.setState({ content: newContent });
            };
            
            e!.currentTarget.remove();
            // this.setState({ disabled: true, unsaved: true });
        };
    };
}