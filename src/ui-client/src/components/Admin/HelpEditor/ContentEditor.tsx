/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { HelpPage, HelpPageContent } from '../../../models/Help/Help';
import { TextArea } from '../Section/TextArea';
import TextareaAutosize from 'react-textarea-autosize';
import './ContentEditor.css';

interface Props {
    content: HelpPageContent[];
    currentPage: HelpPage;
    dispatch: any;
}

interface State {
    selected: boolean;
}

export class ContentEditor extends React.Component<Props, State> {
    private className = "content-editor"

    constructor(props: Props){
        super(props)
        this.state = {
            selected: false
        }
    }

    public render() {
        const c = this.className;
        const { content, currentPage, dispatch } = this.props;

        return (
            <div className={c}>
                {content.map(c => c.textContent &&
                    <div className={`${this.className}-text`}>
                        <TextareaAutosize
                            readOnly={false}
                            spellCheck={true}
                            value={c.textContent}
                            onClick={this.handleContentEditClick}
                        >
                        </TextareaAutosize>
                    </div>
                )}
            </div>
        );
    };

    private handleContentEditClick = () => {
        const selected = this.state.selected;
        this.setState({
            selected: !selected
        })
    };
}