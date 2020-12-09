/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { HelpPageContent } from '../../../models/Help/HelpPages';

interface Props {
    content: HelpPageContent;
}

export class Content extends React.Component<Props> {
    private className = "content"

    public render() {
        const { content } = this.props;
        const c = this.className;

        return (
            <div className={c}>
                {content.textContent}

                {/* Check out Media from reactstraps for images */}
                {/* <img src={`data:image/jpeg;base64,${content.imageContent}`} /> */}
            </div>
        )
    }
}