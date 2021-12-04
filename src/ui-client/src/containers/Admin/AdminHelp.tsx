/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { showConfirmationModal } from '../../actions/generalUi';
import { setCurrentHelpPage } from '../../actions/helpPage';
import { adminHelpContentUnsaved, confirmLeavingAdminHelpContent, createAdminHelpPageContent,
         deleteHelpPageAndContent, isAdminHelpContentNew, resetAdminHelpContent, setAdminHelpContent,
         setCurrentAdminHelpContent, updateAdminHelpPageContent } from '../../actions/admin/helpPage';
import { ContentRowEditor } from '../../components/Admin/HelpEditor/ContentRowEditor';
import { TextEditor } from '../../components/Admin/HelpEditor/TextEditor';
import { AdminHelpContent, ContentRow, CreateHelpPage,
         CreateHelpPageDTO, UpdateHelpPageContent, UpdateHelpPageContentDTO } from '../../models/admin/Help';
import { HelpPage } from '../../models/Help/Help';
import { ConfirmationModalState } from '../../models/state/GeneralUiState';
import { HelpPageLoadState } from '../../models/state/HelpState';
import { generate as generateId } from 'shortid';
import './AdminHelp.css';

interface Props {
    dispatch: any;
    content: AdminHelpContent;
    currentContent: AdminHelpContent;
    currentPage: HelpPage;
    createNew: boolean;
    unsaved: boolean;
}

export class AdminHelp extends React.Component<Props> {
    private className = "admin-help"

    public render() {
        const c = this.className;
        const { dispatch, currentContent, unsaved } = this.props;

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
                        textHandler={this.handleTextChange}
                    />

                    {currentContent.content.map((cr,i) =>
                        <ContentRowEditor
                            key={cr.id}
                            dispatch={dispatch}
                            contentRow={cr}
                            index={i}
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

    private handleTextChange = (val: string, propName: string) => {
        const { dispatch, currentContent } = this.props;
        const newContent = Object.assign({}, currentContent, { [propName]: val }) as AdminHelpContent;
        
        dispatch(setCurrentAdminHelpContent(newContent));
        dispatch(adminHelpContentUnsaved(true));
    };

    private handleContentChange = (val: string, index: number) => {
        const { dispatch, currentContent } = this.props;
        // Make copy of current content to edit
        const contentCopy = currentContent.content.slice();

        // WORK ON: dont feel comfortable with filter, is there a better way?
        const textContentLength = contentCopy.filter(c => c.textContent).length;

        // Find content row via index to edit
        const contentRow = contentCopy.find((_, i) => i === index);

        if (val) {
            const updatedContentRow = Object.assign({}, contentRow, { textContent: val }) as ContentRow;
            contentCopy.splice(index, 1, updatedContentRow);
        } else if (!val && textContentLength === 1) {
            const updatedContentRow = Object.assign({}, contentRow, { textContent: '' }) as ContentRow;
            contentCopy.splice(index, 1, updatedContentRow);
        } else {
            contentCopy.splice(index, 1);
        }

        const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpContent;
        dispatch(setCurrentAdminHelpContent(newContent));

        dispatch(adminHelpContentUnsaved(true));
    };

    private handleImageSizeChange = (val: number, index: number) => {
        const { dispatch, currentContent } = this.props;
        // Make copy of current content to edit
        const contentCopy = currentContent.content.slice();
        // Find content row via index to edit
        const contentRow = contentCopy.find((_, i) => i === index);

        if (val) {
            const updatedContentRow = Object.assign({}, contentRow, { imageSize: val }) as ContentRow;
            contentCopy.splice(index, 1, updatedContentRow);
        } else {
            contentCopy.splice(index, 1);
        }

        const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpContent;
        dispatch(setCurrentAdminHelpContent(newContent));

        dispatch(adminHelpContentUnsaved(true));
    };

    private handleDeleteRow = (index: number) => {
        const { dispatch, currentContent } = this.props;
        const contentCopy = currentContent.content.slice();
        contentCopy.splice(index, 1);

        const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpContent;
        dispatch(setCurrentAdminHelpContent(newContent));

        dispatch(adminHelpContentUnsaved(true));
    };

    private handleUndoChanges = () => {
        const { dispatch, content, createNew, unsaved } = this.props;

        if (createNew && unsaved) {
            dispatch(confirmLeavingAdminHelpContent());
        } else {
            dispatch(setCurrentAdminHelpContent(content));
            dispatch(adminHelpContentUnsaved(false));
        };
    };

    private handleSaveChanges = () => {
        const { dispatch, currentContent, createNew, currentPage } = this.props;
        const updateContent: UpdateHelpPageContent[] = [];
        const createContent: CreateHelpPage[] = [];

        if (createNew) {
            currentContent.content.map(c => {
                const createdContent = {
                    title: currentContent.title,
                    category: currentContent.category,
                    orderId: c.orderId,
                    type: c.type,
                    textContent: c.textContent,
                    imageId: c.imageId,
                    imageContent: c.imageContent,
                    imageSize: c.imageSize
                } as CreateHelpPageDTO;
                createContent.push(createdContent);
            });
            dispatch(createAdminHelpPageContent(createContent));       
        } else {
            currentContent.content.map(c => {
                const updatedContent = {
                    title: currentContent.title,
                    category: currentContent.category,
                    pageId: currentPage.id,
                    orderId: c.orderId,
                    type: c.type,
                    textContent: c.textContent,
                    imageId: c.imageId,
                    imageContent: c.imageContent,
                    imageSize: c.imageSize
                } as UpdateHelpPageContentDTO;
                updateContent.push(updatedContent);
            });
            dispatch(updateAdminHelpPageContent(updateContent));
        };
    };

    private handleContentGoBackClick = () => {
        const { dispatch, unsaved } = this.props;
        unsaved ? dispatch(confirmLeavingAdminHelpContent()) : dispatch(resetAdminHelpContent());
    };

    private handleDeleteContent = () => {
        const { dispatch, currentPage, currentContent, createNew } = this.props;

        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the page, "${currentContent.title}"? This will take effect immediately and can't be undone.`,
            header: 'Delete Page',
            onClickNo: () => null,
            onClickYes: () => {
                createNew
                    ? dispatch(resetAdminHelpContent())
                    : dispatch(deleteHelpPageAndContent(currentPage));
            },
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Delete Page`
        };
        dispatch(showConfirmationModal(confirm));
    };

    private handleNewSection = (index: number, pageId: string, text: boolean, e?: React.ChangeEvent<HTMLInputElement>) => {    
        const { dispatch, currentContent } = this.props;
        // Make copy of current content to edit
        const contentCopy = currentContent.content.slice();
        const uniqueId = generateId();

        if (text) {
            const con = Object.assign({}, {
                id: uniqueId,
                pageId: pageId,
                orderId: 0,
                type: 'text',
                textContent: 'New Section Added.',
                imageId: '',
                imageContent: '',
                imageSize: 0
            }) as ContentRow;

            // Add new text section at index
            contentCopy.splice(index, 0, con);
            // Order the content rows by their index
            contentCopy.forEach((c,i) => c.orderId = i);
            
            const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpContent;
            dispatch(setCurrentAdminHelpContent(newContent));
        } else {
            const img = e!.currentTarget.files!.item(0)!;
            const imageId = img.name;
            const reader = new FileReader();
            reader.readAsDataURL(img);

            reader.onload = () => {
                const imageString = reader.result!.toString().split(',')[1];
                const con = Object.assign({}, {
                    id: uniqueId,
                    pageId: pageId,
                    orderId: 0,
                    type: 'image',
                    textContent: '',
                    imageId: imageId,
                    imageContent: imageString,
                    imageSize: 50 // Set initial image size to 50%.
                }) as ContentRow;

                // Add new image section at index
                contentCopy.splice(index, 0, con);
                // Order the content rows by their index
                contentCopy.forEach((c,i) => c.orderId = i);

                const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpContent;
                dispatch(setCurrentAdminHelpContent(newContent));
            };
            
            // Removes input value so that onChange function runs again. Otherwise, nothing happens on onChange because value exists.
            e!.currentTarget.value = '';
        };
        dispatch(adminHelpContentUnsaved(true));
    };
}