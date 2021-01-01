/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 
/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import './TimelinesControlPanelStep.css';

interface Props { 
    clickable: boolean;
    handleClick?: () => void;
    number: number;
    subtext?: string | JSX.Element;
    subComponent?: JSX.Element;
    text: string;
}

export default class TimelinesControlPanelStep extends React.Component<Props> {
    private className = 'timelines-control-panel-step'


    public render() {
        const c = this.className;
        const { clickable, number, subtext, text, subComponent } = this.props;

        return  (
            <div className={`${c} ${(clickable ? 'clickable' : '')}`} onClick={this.handleClick}>
                <div className={`${c}-number`}>{number}</div>
                <div className={`${c}-text`}>{text}</div>
                {subtext && 
                <div className={`${c}-subtext`}>{subtext}</div>
                }
                {subComponent && subComponent}
            </div>
        )
    }

    private handleClick = () => {
        const { clickable, handleClick } = this.props;
        if (clickable && handleClick) {
            handleClick()
        }
    }
}