/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Tooltip } from 'reactstrap';
import { RouteConfig } from '../../config/routes';
import { AdminPanelPane } from '../../models/state/AdminState';
import { Routes } from '../../models/state/GeneralUiState';

interface Props {
    config: RouteConfig;
    currentAdminPane: AdminPanelPane;
    dispatch: any;
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
        const { selectable, isActive, config, clickHandler, dispatch, currentAdminPane } = this.props;
        const c = 'sidebar';
        const id = `${c}-tab_${config.index}`;
        const classes = [ `${c}-tab` ];

        if (selectable) { classes.push('enabled') }
        if (isActive)   { classes.push('selected'); }
           
        return (
            <div className={`${c}-tab-link ${config.display.replace(' ','').toLowerCase()}`} 
                 onClick={clickHandler.bind(null, config.index)}>
                <li className={classes.join(' ')} id={id}>
                    <span className={`${c}-icon`}>{config.icon}</span>
                    <span className={`${c}-text`}>{config.display}</span>
                    {config.index !== Routes.AdminPanel &&
                    <Tooltip 
                        autohide={true}
                        className={`${c}-tooltip`}
                        delay={0}
                        isOpen={this.state.tooltipOpen} 
                        placement="right" 
                        target={id} 
                        toggle={this.toggleTooltip}>
                        {config.display}
                    </Tooltip>
                    }
                </li>
                <div className={`${c}-tab-divider`} />

                {config.subRoutes &&
                    <div className={`${c}-subroute-container`}>
                        {config.subRoutes.map((r,i) => {
                            return (
                                <div 
                                    className={`${c}-subroute ${isActive && i+1 === currentAdminPane ? 'selected' : ''}`} 
                                    key={i} onClick={r.clickHandler.bind(null, dispatch)}>
                                    {r.display}
                                </div>
                            );
                        })}
                    </div>
                }

            </div>
        );
    }

    private toggleTooltip = () => {
        if (window.innerWidth < 1400) {
            this.setState({ tooltipOpen: !this.state.tooltipOpen });
        }
    }
};
