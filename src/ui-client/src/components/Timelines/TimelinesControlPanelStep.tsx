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
    clickHandler?: () => void;
    enabled: boolean;
    number: number;
    subtext?: string | JSX.Element;
    subComponent?: JSX.Element;
    text: string;
}

export default class TimelinesControlPanelStep extends React.Component<Props> {
    private className = 'timelines-control-panel-step'

    public render() {
        const c = this.className;
        const { clickHandler, enabled, number, subtext, text, subComponent } = this.props;
        const classes = [ `${c}` ];

        if (clickHandler) { classes.push('enabled'); }
        if (!enabled)     { classes.push('disabled'); }

        return  (
            <div className={classes.join(' ')} onClick={this.handleClick}>
                <div className={`${c}-number`}>{number}</div>
                <div className={`${c}-text`}>{text}</div>
                {subtext && 
                <div className={`${c}-subtext`}>{subtext}</div>
                }
                {subComponent && enabled &&
                <div className={`${c}-subcomponent`}>
                    {subComponent}
                </div>
                }
            </div>
        )
    }

    private handleClick = () => {
        const { clickHandler, enabled } = this.props;
        if (enabled && clickHandler) {
            clickHandler()
        }
    }
}