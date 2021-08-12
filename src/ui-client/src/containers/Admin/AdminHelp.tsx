/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { Button, Col, Row, Input, ModalHeader } from 'reactstrap';
import { FaCheckSquare, FaRegEdit } from "react-icons/fa";
import { HelpPage, HelpPageContent, HelpCategoryMap, orderId } from '../../models/Help/Help';
import { Content } from '../../components/Help/Content/Content';
import { resetHelpPageContent } from '../../actions/helpPage';
import { ContentRowEditor } from '../../components/Admin/HelpEditor/ContentRowEditor';
import './AdminHelp.css';
import TextareaAutosize from 'react-textarea-autosize';

// import { AdminHelpContentState, AdminHelpPane } from '../../models/state/AdminHelpState';
import { setCurrentAdminHelpContent, updateAdminHelpPageContent, deleteHelpPageAndContent, checkIfAdminHelpContentUnsaved } from '../../actions/admin/helpPage';
import { AdminHelpContent, AdminHelpContentDTO, ContentRow, UpdateHelpPageContent, UpdateHelpPageContentDTO } from '../../models/admin/Help';
import { HelpPageContentTState } from '../../models/state/HelpState';
import { TextEditor } from '../../components/Admin/HelpEditor/TextEditor';
import { ConfirmationModalState } from '../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../actions/generalUi';
import { generate as generateId } from 'shortid';

interface Props {
    currentPage: HelpPage;
    dispatch: any;

    content: AdminHelpContent;
    currentContent: AdminHelpContent;
}

interface State {
    disabled: boolean;
    unsaved: boolean;
    stateIndex: number;
}

export class AdminHelp extends React.Component<Props, State> {
    private className = "admin-help"

    constructor(props: Props) {
        super(props);
        
        this.state = {
            disabled: false,
            unsaved: false,
            stateIndex: 0
        }
    }

    public render() {
        const c = this.className;
        const { dispatch, currentContent } = this.props;
        const { disabled, unsaved } = this.state;
        const arrowMove = disabled ? {marginLeft: "-30%", transition: "3s", transitionTimingFunction: "ease-in-out"} : {};

        currentContent.content.forEach((c, i) => c.orderId = i);

        return (
            <div className={c}>
                <Row className={`${c}-buttons`}>
                    <Col>
                        <IoIosArrowRoundBack
                            className={`${c}-back-arrow`}
                            style={arrowMove}
                            onClick={this.handleContentGoBackClick}>

                            {/* TODO: on hover, show text below */}
                            {/* <span className={`${c}-back-arrow-text`}>
                                Go back
                            </span> */}
                        </IoIosArrowRoundBack>
                    </Col>

                    <Col>
                        <Button className={`${c}-edit-button`} color="secondary" disabled={!disabled} onClick={this.handleUndoChanges}>
                            Undo Changes
                        </Button>

                        <Button className={`${c}-edit-button`} color="success" disabled={!disabled} onClick={this.handleSaveChanges}>
                            Save
                        </Button>

                        <Button className={`${c}-edit-button`} color="danger" disabled={disabled} onClick={this.handleDeleteContent}>
                            Delete
                        </Button>
                    </Col>
                </Row>

                {/* <ReactMarkdown className={`${c}-content-title`} children={category} /> */}
                {/* <ReactMarkdown className={`${c}-content-title`} children={currentPage.title} /> */}

                <div className={`${c}-content-text`}>
                    <TextEditor
                    // talk to NIC: showing the unsaved button when changes happen
                        text={currentContent.title}
                        textHandler={this.handleTitleChange}
                        unsaved={unsaved}
                    />

                    <TextEditor
                        category={true}
                        text={currentContent.category}
                        textHandler={this.handleCategoryChange}
                        unsaved={unsaved}
                    />

                    {currentContent.content.map((cr,i) =>
                        // <div key={i} className={`${c}-content-text`}>
                            <ContentRowEditor
                                key={cr.id}
                                index={i}
                                contentRow={cr}
                                dispatch={dispatch}

                                contentHandler={this.handleContentChange}
                                newSectionHandler={this.handleNewSection}
                                indexHandler={this.updateStateIndex}
                            />
                        // </div>
                    )}
                </div>
            </div>
        );
    };

    private handleTitleChange = (text: string) => {
        const { dispatch, currentContent } = this.props;
        const newContent = Object.assign({}, currentContent, { title: text }) as AdminHelpContent;
        dispatch(setCurrentAdminHelpContent(newContent));

        this.setState({ disabled: true, unsaved: true});
    };

    private handleCategoryChange = (text: string) => {
        const { dispatch, currentContent } = this.props;
        const newContent = Object.assign({}, currentContent, { category: text }) as AdminHelpContent;
        dispatch(setCurrentAdminHelpContent(newContent));

        this.setState({ disabled: true, unsaved: true});
    };

    private handleContentChange = (val: string, index: number) => {
        const { dispatch, currentContent } = this.props;

        // Make copy of current content to edit
        const contentCopy = currentContent.content.slice();
        // Find content row via index to edit
        const contentRow = contentCopy.find((_, i) => i == index);

        if (val) {
            const updatedContentRow = Object.assign({}, contentRow, { textContent: val }) as ContentRow;
            contentCopy.splice(index, 1, updatedContentRow);
        } else {
            contentCopy.splice(index, 1);
        }
        const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpContent;
        dispatch(setCurrentAdminHelpContent(newContent));

        this.setState({ disabled: true, unsaved: true });
    };

    private handleUndoChanges = () => {
        const { dispatch, content } = this.props;
        dispatch(setCurrentAdminHelpContent(content));

        this.setState({ disabled: false, unsaved: false });
    };

    private handleSaveChanges = () => {
        const { dispatch, currentContent } = this.props;
        const updateContent: UpdateHelpPageContent[] = [];

        currentContent.content.map(c => {
            const updatedContent = {
                title: currentContent.title,
                category: currentContent.category,
                pageId: c.pageId,
                orderId: c.orderId,
                type: c.type,
                textContent: c.textContent,
                imageContent: c.imageContent,
                imageId: c.imageId
            } as UpdateHelpPageContentDTO;
            updateContent.push(updatedContent);
        });

        dispatch(updateAdminHelpPageContent(updateContent));
        this.setState({ disabled: false, unsaved: false });
    };

    private handleContentGoBackClick = () => {
        const { dispatch } = this.props;
        const { unsaved } = this.state;
        dispatch(checkIfAdminHelpContentUnsaved(unsaved));
    };

    private handleDeleteContent = () => {
        const { dispatch, currentPage, currentContent } = this.props;

        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the page, "${currentContent.title}"? This will take effect immediately and can't be undone.`,
            header: 'Delete Page',
            onClickNo: () => null,
            onClickYes: () => { dispatch(deleteHelpPageAndContent(currentPage)) },
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Delete Page`
        };
        dispatch(showConfirmationModal(confirm));
    };

    // new section logic
    private handleNewSection = (above: boolean, indexZ: number, pageId: string, text: boolean, e?: React.ChangeEvent<HTMLInputElement>) => {    
        const { dispatch, currentContent } = this.props;
        // Make copy of current content to edit
        const contentCopy = currentContent.content.slice();
        const uniqueId = generateId();

        const stateIndex = this.state.stateIndex;
        const index = above ? stateIndex : stateIndex+1;

        if (text) {
            const con = Object.assign({}, {
                id: uniqueId,
                pageId: pageId,
                orderId: 0,
                type: 'text',
                textContent: 'New Section Added.',
                imageContent: '',
                imageId: ''
            }) as ContentRow;
            contentCopy.splice(index, 0, con);
            contentCopy.forEach((c,i) => c.orderId = i);
            
            const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpContent;
            dispatch(setCurrentAdminHelpContent(newContent));

            this.setState({ disabled: true, unsaved: true });
        } else {
            const image = e!.currentTarget.files!.item(0)!;
            const imgId = image.name;
            const reader = new FileReader();
            reader.readAsDataURL(image);

            reader.onload = () => {
                const imageString = reader.result!.toString().split(',')[1];
                const con = Object.assign({}, {
                    id: uniqueId,
                    pageId: pageId,
                    orderId: 0,
                    type: 'image',
                    textContent: '',
                    imageContent: imageString,
                    imageId: imgId
                }) as ContentRow;

                contentCopy.splice(index, 0, con);
                contentCopy.forEach((c,i) => c.orderId = i);

                const newContent = Object.assign({}, currentContent, { content: contentCopy }) as AdminHelpContent;
                dispatch(setCurrentAdminHelpContent(newContent));
                
                this.setState({ disabled: true, unsaved: true });
            };
            e!.currentTarget.remove();
        };
        this.setState({ stateIndex: above ? stateIndex+1 : stateIndex });
    };

    private updateStateIndex = (indexVal: number) => {
        this.setState({ stateIndex: indexVal });
    };
}

// Uploading files
// https://www.positronx.io/understand-html5-filereader-api-to-upload-image-and-text-files/
// https://stackoverflow.com/questions/7179627/files-input-change-event-fires-only-once