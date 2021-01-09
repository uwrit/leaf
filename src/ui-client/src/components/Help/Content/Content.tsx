/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
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
        const altText = "content-image";
        const { content, currentPage } = this.props;

        return (
            <div className={c}>
                <IoIosArrowRoundBack className={`${c}-back-arrow`} onClick={this.handleContentGoBackClick} />
                
                <div className={`${c}-display`}>
                    <div className={`${c}-title`}>
                        <b>{currentPage.title}</b>
                    </div>

                    {content.map((content, i) =>
                        <div className={`${c}-text`} key={i}>
                            {content.textContent != null &&
                                <TextareaAutosize
                                    readOnly={true}
                                    spellCheck={false}
                                    value={content.textContent}>
                                </TextareaAutosize>
                            }

                            {/* Load image if and only if it exists. */}
                            <div className={`${c}-image`}>
                                {content.imageContent != null &&
                                    <img src={`data:image/jpeg;base64,${content.imageContent}`} alt={altText} />
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    private handleContentGoBackClick = () => {
        const { dispatch } = this.props;
        dispatch(resetHelpPageContent());
    };
}