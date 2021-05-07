/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { Button, Col, Row } from 'reactstrap';
import { FaCheckSquare, FaRegEdit } from "react-icons/fa";
import { HelpPage, HelpPageContent, HelpCategoryMap } from '../../models/Help/Help';
import { Content } from '../../components/Help/Content/Content';
import { resetHelpPageContent } from '../../actions/helpPage';
import { ContentEditor } from '../../components/Admin/HelpEditor/ContentEditor';
import './AdminHelp.css';
import TextareaAutosize from 'react-textarea-autosize';

import { UpdateHelpPageContent } from '../../models/admin/Help';
import { updateAdminHelpPageContent } from '../../actions/admin/helpPage';
import { ContentProps } from '../../components/Admin/HelpEditor/Props';

interface Props {
    categories: HelpCategoryMap;
    content: HelpPageContent[];
    currentPage: HelpPage;
    dispatch: any;

    adminHelpContent: UpdateHelpPageContent;
}

interface State {
    disabled: boolean;
    categ: string;
    title: string;
    titleSelected: boolean;
}

export class AdminHelp extends React.Component<Props, State> {
    private className = "admin-help"

    constructor(props: Props) {
        super(props);
        this.state = {
            disabled: false,
            categ: this.props.categories.get(this.props.currentPage.categoryId)!.category,
            title: this.props.currentPage.title,
            titleSelected: false,
        }
    }

    public render() {
        const c = this.className;
        const { categories, content, currentPage, dispatch } = this.props;
        const { disabled } = this.state;
        const arrowMove = disabled ? {marginLeft: "-30%", transition: "3s", transitionTimingFunction: "ease-in-out"} : {};
        const category = categories.get(currentPage.categoryId)!.category;
        
        const contentProps: ContentProps = {
            categories: categories,
            content: content,
            currentPage: currentPage,
            changed: false,
            changeHandler: this.handleInputChange,
            dispatch
        };

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
                {this.getTitleAndCategory()}

                {content.map((c,i) => c.textContent &&
                    // <div key={i} className={`${c}-content-text`}>
                        <ContentEditor
                            key={i}
                            content={c}
                            // dispatch={dispatch}
                            buttonDisableHandler={this.handleButtonDisableClick}
                        />
                    // </div>
                )}
                </div>
            </div>
        );
    };

    private handleContentGoBackClick = () => {
        const { dispatch } = this.props;
        dispatch(resetHelpPageContent());
    };

    private handleButtonDisableClick = (disabled: boolean) => {
        this.setState({
            disabled: disabled
        })
    };

    private handleNewSection = () => { };
    private handleUndoChanges = () => { };
    private handleSaveChanges = () => {
        const { categories, currentPage, content, dispatch } = this.props;
        const category = categories.get(currentPage.categoryId)!.category;
        const title = currentPage.title;
        const con = content[0];
        const cont: UpdateHelpPageContent = {
            title: title,
            category: category,
            pageId: con.pageId,
            orderId: con.orderId,
            type: con.type,
            textContent: con.textContent,
            imageContent: con.imageContent,
            imageId: con.imageId
        };
        
        dispatch(updateAdminHelpPageContent(cont, currentPage));

    };
    private handleDeleteContent = () => {
        const { dispatch, currentPage } = this.props;
        // dispatch(deleteHelpPageAndContent(currentPage.id, user))
    };

    private handleClick = () => {
        this.setState({
            titleSelected: true
        });
    };
    
    private handleInputChange = (val: any, propName: string) => {
        return ;
    };

    private handleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        this.setState({
            title: e.currentTarget.value,
            categ: e.currentTarget.value
        })
    };

    private getTitleAndCategory = () => {
        const c = this.className;
        const { categories, currentPage } = this.props;
        const { title, titleSelected, categ } = this.state;
        const category = categories.get(currentPage.categoryId)!.category;

        if (titleSelected) {
            return (
                <div className={`${c}-content-title`} onClick={this.handleClick}>
                    {/* <ReactMarkdown children={currentPage.title} /> */}
                    {/* <ReactMarkdown children={category} /> */}
                    <TextareaAutosize onChange={this.handleChange} value={title} />
                    <br></br>
                    <TextareaAutosize onChange={this.handleChange} value={categ} />
                </div>
            )
        };

        return (
            <div className={`${c}-content-title`} onClick={this.handleClick}>
                <ReactMarkdown children={currentPage.title} />
            </div>
        )
    };
}