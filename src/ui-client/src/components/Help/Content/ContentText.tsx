/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { HelpPageContent } from '../../../models/Help/Help';
import TextareaAutosize from 'react-textarea-autosize';
import './ContentText.css';

interface Props {
    content: HelpPageContent;
}

export class ContentText extends React.Component<Props> {
    private className = "content-text"

    public render() {
        const c = this.className;
        const { content } = this.props;

        return (
            <div className={c}>
                {/* Load text if and only if it exists. */}
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
                        <img src={`data:image/jpeg;base64,${content.imageContent}`} />
                    }
                </div>
            </div>
        )
    }
}