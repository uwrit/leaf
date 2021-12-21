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
            <div className={`${c}-container`}>
                <IoIosArrowRoundBack
                    className={`${c}-back-arrow`}
                    onClick={this.handleContentGoBackClick}>
                </IoIosArrowRoundBack>

                <div className={`${c}-display`}>
                    <div className={`${c}-title`}>
                        {currentPage.title}
                    </div>

                    {content.map(c => this.getContent(c))}
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

        if (content.textContent) {
            return (
                <div className={`${c}-text`} key={content.id}>
                    {/* linkTarget allows for links to open in new tab. */}
                    <ReactMarkdown children={content.textContent} linkTarget={"_blank"} />
                </div>
            );
        } else if (content.imageContent) {
            return (
                <div className={`${c}-image`} key={content.id}>
                    <img
                        alt={content.imageId}
                        src={`data:image;base64,${content.imageContent}`}
                        style={{maxWidth: `${content.imageSize}%`}}
                    />
                </div>
            );
        };

        return ;
    };
}