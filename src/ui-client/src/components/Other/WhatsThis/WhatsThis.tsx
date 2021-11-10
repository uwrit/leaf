/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './WhatsThis.css';

interface Props { 
    body: string;
    question: string;
}

export class WhatsThis extends React.Component<Props> {
    private className = 'whats-this';

    public shouldComponentUpdate(nextProps: Props) { 
        return false; 
    }

    public render() {
        const { body, question } = this.props;
        const c = this.className;

        return (
            <div className={c}>
                <div className={`${c}-question`}>
                    {question}
                    <div className={`${c}-body`}>{body}</div>
                </div>
            </div>
        );
    }
}