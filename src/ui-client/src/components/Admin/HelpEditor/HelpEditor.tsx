/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { showConfirmationModal } from '../../../actions/generalUi';
import { createAdminHelpPageContent, confirmLeavingAdminHelpContent, deleteHelpPageAndContent,
        resetAdminHelpContent, updateAdminHelpPageContent, isAdminHelpPageUnsaved,
        setCurrentAdminHelpPageAndContent } from '../../../actions/admin/helpPage';
import { AdminHelpPage, AdminHelpPageContent, AdminHelpPageAndContent } from '../../../models/admin/Help';
import { ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { ContentRowEditor } from './Content/ContentRowEditor';
import { TextEditor } from './Content/TextEditor';
import './HelpEditor.css';

import { Dropdown, DropdownToggle, DropdownItem, DropdownMenu, Input } from 'reactstrap';
import { AdminHelpPageCategoryExt } from '../../../models/admin/Help';

interface Props {
    dispatch: any;
    content: AdminHelpPageAndContent;
    currentContent: AdminHelpPageAndContent;
    currentPage: AdminHelpPage;
    isNew: boolean;
    unsaved: boolean;

    categories: AdminHelpPageCategoryExt[];
}

export class HelpEditor extends React.Component<Props> {
    private className = "help-editor"

    public render() {
        const c = this.className;
        const { dispatch, currentContent, unsaved } = this.props;

        const isLastRow = this.isLastContentRow();

        return (
            <div className={c}>
                <Row className={`${c}-buttons`}>
                    <Col>
                        <IoIosArrowRoundBack
                            className={`${c}-back-arrow`}
                            onClick={this.handleContentGoBackClick}>
                        </IoIosArrowRoundBack>
                    </Col>

                    <Col>
                        <Button className={`${c}-edit-button`} color="secondary" disabled={!unsaved} onClick={this.handleUndoChanges}>
                            Undo Changes
                        </Button>

                        <Button className={`${c}-edit-button`} color="success" disabled={!unsaved} onClick={this.handleSaveChanges}>
                            Save
                        </Button>

                        <Button className={`${c}-edit-button`} color="danger" onClick={this.handleDeleteContent}>
                            Delete
                        </Button>
                    </Col>
                </Row>

                <div className={`${c}-content-text`}>
                    <TextEditor
                        text={currentContent.title}
                        textHandler={this.handleTitleChange}
                    />

                    {/*  */}
                    <Dropdown isOpen={true}>
                        <DropdownToggle caret>
                            {this.props.categories.find(c => c.id === this.props.currentPage.categoryId)!.name}
                        </DropdownToggle>
                        <DropdownMenu>
                            {this.props.categories.map((c, i) =>
                                <DropdownItem>{c.name}</DropdownItem>
                            )}
                            <div><Input/></div>
                        </DropdownMenu>
                    </Dropdown>
                    {/*  */}

                    {currentContent.content.map((cr,i) =>
                        <ContentRowEditor
                            key={cr.id}
                            dispatch={dispatch}
                            contentRow={cr}
                            index={i}
                            isLastRow={isLastRow}
                            contentHandler={this.handleContentChange}
                            newSectionHandler={this.handleNewSection}
                            imageSizeHandler={this.handleImageSizeChange}
                            deleteRowHandler={this.handleDeleteRow}
                        />
                    )}
                </div>
            </div>
        );
    };

    private isLastContentRow = (): boolean => {
        const { currentContent } = this.props;
        const contentLength = currentContent.content.length;
        
        if (contentLength === 1) { return true };
        
        return false;
    };

    private handleTitleChange = (val: string, propName: string) => {
        const { dispatch, currentContent } = this.props;
        const newContent = Object.assign({}, currentContent, { [propName]: val }) as AdminHelpPageAndContent;
        
        dispatch(setCurrentAdminHelpPageAndContent(newContent));
        dispatch(isAdminHelpPageUnsaved(true));
    };

    private handleContentChange = (val: string, index: number) => {
        const { dispatch, currentContent } = this.props;
        // Make copy of current content to edit
        const contentCopy = currentContent.content.slice();

        // TODO: dont feel comfortable with filter, is there a better way?
        const textContentRows = contentCopy.filter(c => c.type === "text").length;

        // Find content row via index to edit
        const contentRow = contentCopy.find((_, i) => i === index);

        if (val) {
            const updatedContentRow = Object.assign({}, contentRow, { textContent: val }) as AdminHelpPageContent;
            contentCopy.splice(index, 1, updatedContentRow);
        } else if (!val && textContentRows === 1) {
            const updatedContentRow = Object.assign({}, contentRow, { textContent: '' }) as AdminHelpPageContent;
            contentCopy.splice(index, 1, updatedContentRow);
        } else {
            contentCopy.splice(index, 1);
        };

        const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpPageAndContent;
        dispatch(setCurrentAdminHelpPageAndContent(newContent));

        dispatch(isAdminHelpPageUnsaved(true));
    };

    private handleImageSizeChange = (val: number, index: number) => {
        const { dispatch, currentContent } = this.props;
        // Make copy of current content to edit
        const contentCopy = currentContent.content.slice();
        // Find content row via index to edit
        const contentRow = contentCopy.find((_, i) => i === index);
        const isLastContentRow = this.isLastContentRow();

        if (val) {
            const updatedContentRow = Object.assign({}, contentRow, { imageSize: val }) as AdminHelpPageContent;
            contentCopy.splice(index, 1, updatedContentRow);
        } else if (!val && !isLastContentRow) {
            contentCopy.splice(index, 1)
        }

        const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpPageAndContent;
        dispatch(setCurrentAdminHelpPageAndContent(newContent));

        dispatch(isAdminHelpPageUnsaved(true));
    };

    private handleDeleteRow = (index: number) => {
        const { dispatch, currentContent } = this.props;
        const contentCopy = currentContent.content.slice();
        
        contentCopy.splice(index, 1);
        dispatch(isAdminHelpPageUnsaved(true));

        const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpPageAndContent;
        dispatch(setCurrentAdminHelpPageAndContent(newContent));
    };

    private handleUndoChanges = () => {
        const { dispatch, content, isNew, unsaved } = this.props;

        if (isNew && unsaved) {
            dispatch(confirmLeavingAdminHelpContent());
        } else {
            dispatch(setCurrentAdminHelpPageAndContent(content));
            dispatch(isAdminHelpPageUnsaved(false));
        };
    };

    private handleSaveChanges = () => {
        const { dispatch, currentContent, isNew, currentPage } = this.props;

        if (isNew) {
            dispatch(createAdminHelpPageContent(currentContent));
        } else {
            dispatch(updateAdminHelpPageContent(currentPage.id, currentContent));
        };
    };

    private handleContentGoBackClick = () => {
        const { dispatch, unsaved } = this.props;
        unsaved ? dispatch(confirmLeavingAdminHelpContent()) : dispatch(resetAdminHelpContent());
    };

    private handleDeleteContent = () => {
        const { dispatch, currentPage, currentContent, isNew } = this.props;

        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the page, "${currentContent.title}"? This will take effect immediately and can't be undone.`,
            header: 'Delete Page',
            onClickNo: () => null,
            onClickYes: () => {
                isNew
                    ? dispatch(resetAdminHelpContent())
                    : dispatch(deleteHelpPageAndContent(currentPage));
            },
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Delete Page`
        };
        dispatch(showConfirmationModal(confirm));
    };

    private handleNewSection = (index: number, pageId: string, isTypeText: boolean, e?: React.ChangeEvent<HTMLInputElement>) => {    
        const { dispatch, currentContent } = this.props;
        // Make copy of current content to edit
        const contentCopy = currentContent.content.slice();
        const isLastContentRow = this.isLastContentRow();
        const isLastTextRowEmpty: boolean = (!contentCopy[0].textContent && contentCopy[0].type === "text");
        
        if (isLastContentRow && isLastTextRowEmpty) {
            contentCopy.splice(0, 1);
        };

        if (isTypeText) {
            const con = Object.assign({}, {
                id: '',
                pageId: pageId,
                orderId: 0,
                type: 'text',
                textContent: 'New Section Added.',
                imageId: '',
                imageContent: '',
                imageSize: 0
            }) as AdminHelpPageContent;

            // Add new text section at index
            contentCopy.splice(index, 0, con);
            // Order the content rows by their index
            contentCopy.forEach((c,i) => c.orderId = i);
            
            const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpPageAndContent;
            dispatch(setCurrentAdminHelpPageAndContent(newContent));
        } else {
            const image = e!.currentTarget.files!.item(0)!;
            const imageId = image.name;
            const reader = new FileReader();
            reader.readAsDataURL(image);

            reader.onload = () => {
                const imageString = reader.result!.toString().split(',')[1];
                const con = Object.assign({}, {
                    id: '',
                    pageId: pageId,
                    orderId: 0,
                    type: 'image',
                    textContent: '',
                    imageId: imageId,
                    imageContent: imageString,
                    imageSize: 50 // Set initial image size to 50%.
                }) as AdminHelpPageContent;

                // Add new image section at index
                contentCopy.splice(index, 0, con);
                // Order the content rows by their index
                contentCopy.forEach((c,i) => c.orderId = i);

                const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpPageAndContent;
                dispatch(setCurrentAdminHelpPageAndContent(newContent));
            };
            
            // Removes input value so that onChange function runs again.
            // Otherwise, nothing happens on onChange because value exists.
            e!.currentTarget.value = '';
        };
        dispatch(isAdminHelpPageUnsaved(true));
    };
}