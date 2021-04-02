/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FaRegEdit } from "react-icons/fa";
import { HelpPage, HelpPageContent } from '../../models/Help/Help';
import { Content } from '../../components/Help/Content/Content';
import { ContentEditor } from '../../components/Admin/HelpEditor/ContentEditor';
import './AdminHelp.css';

interface Props {
    content: HelpPageContent[];
    currentPage: HelpPage;
    dispatch: any;
}

interface State {
    editMode: boolean;
}

export class AdminHelp extends React.Component<Props, State> {
    private className = "admin-help"

    constructor(props: Props) {
        super(props);
        this.state = {
            editMode: false
        }
    }

    public render() {
        const c = this.className;
        const { content, currentPage, dispatch } = this.props;
        const { editMode } = this.state;

        return (
            <div className={c}>
                <FaRegEdit
                className={`${c}-edit-button`}
                onClick={this.handleContentEditClick}
                />

                {editMode
                    ? <ContentEditor content={content} currentPage={currentPage} dispatch={dispatch} />
                    : <Content content={content} currentPage={currentPage} dispatch={dispatch} />
                }
            </div>
        );
    };

    private handleContentEditClick = () => {
        const editMode = this.state.editMode;
        this.setState({
            editMode: !editMode
        })
    };
}