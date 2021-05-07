/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { resetHelpPageContent } from '../../../actions/helpPage';
import { HelpPage, HelpPageContent } from '../../../models/Help/Help';
import TextareaAutosize from 'react-textarea-autosize';
import './Content.css';

interface Props {
    content: HelpPageContent[];
    currentPage: HelpPage;
    dispatch: any;
}

export class Content extends React.Component<Props> {
    private className = "content"

    public render() {
        const c = this.className;
        const { content, currentPage } = this.props;

        return (
            <div className={c}>
                <IoIosArrowRoundBack
                    className={`${c}-back-arrow`}
                    onClick={this.handleContentGoBackClick}>

                    {/* TODO: on hover, show text below */}
                    {/* <span className={`${c}-back-arrow-text`}>
                        Go back
                    </span> */}
                </IoIosArrowRoundBack>

                <div className={`${c}-display`}>
                    <div className={`${c}-title`}>
                        {/* <b>{currentPage.title}</b> */}
                        <ReactMarkdown children={currentPage.title} />
                        
                    </div>

                    {content.map(content => this.getContent(content))}
                </div>
            </div>
        );
    };

    private handleContentGoBackClick = () => {
        const { dispatch } = this.props;
        dispatch(resetHelpPageContent());
    };

    private getContent = (content: HelpPageContent) => {
        const c = this.className;
        const altText = "content-image";

        if (content.textContent != null) {
            return (
                <div className={`${c}-text`}>
                    {/* <TextareaAutosize
                        readOnly={true}
                        spellCheck={false}
                        value={content.textContent}>
                    </TextareaAutosize> */}
                    <ReactMarkdown children={content.textContent} />
                </div>
            );
        } else if (content.imageContent != null) {
            return (
                <div className={`${c}-image`}>
                    {/* <img
                        // src={`data:image/jpeg;base64,${content.imageContent}`}
                        src={`data:image;base64,${content.imageContent}`}
                        alt={altText}
                    /> */}
                    {/* TODO: page loads slower compared to using the img tag. */}
                    <ReactMarkdown
                        children={`![${altText}](data:image;base64,${content.imageContent})`}
                    />
                </div>
            );
        }

        return ;
    };
}