/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { HelpPage, HelpPageContent } from '../../../models/Help/Help';
import { Content } from '../../Help/Content/Content';
import { TextArea } from '../Section/TextArea';
import './ContentEditor.css';

interface Props {
    content: HelpPageContent[];
    currentPage: HelpPage;
    dispatch: any;
}

interface State {
    txt: string;
}

export class ContentEditor extends React.Component<Props, State> {
    private className = "content-editor"

    constructor(props: Props){
        super(props)
        this.state = {txt: ''}
    }

    public render() {
        const c = this.className;
        const { content, currentPage, dispatch } = this.props;

        return (
            <div className={c}>
                {content.map(c =>
                    <TextArea
                        changeHandler={this.handleChange}
                        propName={c.id.toString()}
                        // value={c.textContent}
                        value={this.state.txt}
                    >

                    </TextArea>
                )}
            </div>
        );
    };

    private handleChange = (val: any, propName: string) => {
        this.setState({txt: val})
    }
}

// changeHandler: (val: any, propName: string) => any;