/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Tooltip } from 'reactstrap';

interface Props {
    display: string;
    path: string;
    icon: any;
    index: number;
    isActive: boolean;
    clickHandler: (i: number) => void;
    selectable: boolean;
}

interface State {
    tooltipOpen: boolean;
}

export class SidebarTab extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            tooltipOpen: false
        }
    }
    
    public render () {
        const { selectable, isActive, icon, index, display } = this.props;
        const c = 'sidebar';
        const id = `${c}-tab_${index}`;
        const classes = [ `${c}-tab` ];

        if (selectable) { classes.push('enabled') }
        if (isActive)   { classes.push('selected'); }
           
        return (
            <div className={`${c}-tab-link ${display.replace(' ','').toLowerCase()}`} 
                 onClick={this.props.clickHandler.bind(null, index)}>
                <li className={classes.join(' ')} id={id}>
                    <span className={`${c}-icon`}>{icon}</span>
                    <span className={`${c}-text`}>{display}</span>
                    <Tooltip 
                        autohide={true}
                        className={`${c}-tooltip`}
                        delay={0}
                        isOpen={this.state.tooltipOpen} 
                        placement="right" 
                        target={id} 
                        toggle={this.toggleTooltip}
                    >
                        {display}
                    </Tooltip>
                </li>
                <div className={`${c}-tab-divider`} />
            </div>
        );
    }

    private toggleTooltip = () => {
        if (window.innerWidth < 1400) {
            this.setState({ tooltipOpen: !this.state.tooltipOpen });
        }
    }
};
