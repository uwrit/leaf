/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import { PanelHandlers } from './PanelGroup';

interface Props {
    handlers: PanelHandlers;
    index: number;
    panel: PanelModel;
}

interface State {
    dropdownOpen: boolean
}

export default class CountDropdown extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { dropdownOpen: false };
    }

    public shouldComponentUpdate(nextProps: Props, nextState: State) {
        const { panel, index } = this.props;
        const { dropdownOpen } = this.state;
        
        // Update the dropdown state changed
        if (dropdownOpen !== nextState.dropdownOpen) {
            return true;
        }
        // Update if the mincount is different
        else if (panel.subPanels[index].minimumCount !== nextProps.panel.subPanels[nextProps.index].minimumCount) {
            return true;
        }
        // Else don't update
        return false;
    }
    
    public toggle = () => {
        this.setState((prevState: any) => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    public selectItem = (item: any) => {
        const { handlers, index, panel } = this.props;
        const text: string = item.target.innerText;
        const val: number = +text.replace('At Least ','').replace('x','').trim();

        handlers.handleSubPanelCount(panel.index, index, val);
    }

    public render() {
        const { index, panel } = this.props;
        const { dropdownOpen } = this.state;
        const minCount = panel.subPanels[index].minimumCount;
        
        return (
            <Dropdown isOpen={dropdownOpen} toggle={this.toggle} className="panel-header-count">
                <DropdownToggle caret={true}>
                    At Least {minCount}x
                </DropdownToggle>
                <DropdownMenu>
                    {new Array(10).fill(null).map((val: any, i: number) => {
                        const classes = `leaf-dropdown-item ${minCount === (i + 1) ? 'selected' : ''}`;
                        return <DropdownItem className={classes} key={i} onClick={this.selectItem}>At Least {i + 1}x</DropdownItem>
                    })}
                </DropdownMenu>
            </Dropdown>
        );
    }
}