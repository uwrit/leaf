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
import { HelpPage, HelpPageContent } from '../../../models/help/Help';
import './Content.css';

interface Props {
    contentRows: HelpPageContent[];
    currentPage: HelpPage;
    dispatch: any;
}

export class Content extends React.Component<Props> {
    private className = "content"

    public render() {
        const c = this.className;
        const { contentRows, currentPage } = this.props;

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

                    {contentRows.map(cr => this.getContent(cr))}
                </div>
            </div>
        );
    };

    private handleContentGoBackClick = () => {
        const { dispatch } = this.props;
        dispatch(resetHelpPageContent());
    };

    private getContent = (row: HelpPageContent) => {
        const c = this.className;

        if (row.textContent) {
            return (
                <div className={`${c}-text`} key={row.id}>
                    {/* linkTarget allows for links to open in new tab. */}
                    <ReactMarkdown children={row.textContent} linkTarget={"_blank"} />
                </div>
            );
        } else if (row.imageContent) {
            return (
                <div className={`${c}-image`} key={row.id}>
                    <img
                        alt={row.imageId}
                        src={`data:image;base64,${row.imageContent}`}
                        style={{maxWidth: `${row.imageSize}%`}}
                    />
                </div>
            );
        };

        return ;
    };
}