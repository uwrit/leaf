/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { setSubPanelCount } from '../../../actions/panels';
import { Panel as PanelModel } from '../../../models/panel/Panel';

interface State {
    dropdownOpen: boolean
}

interface Props {
    dispatch: any
    index: number,
    panel: PanelModel,
}

export default class CountDropdown extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.state = { dropdownOpen: false };
    }

    public shouldComponentUpdate(nextProps: Props, nextState: State) {
        
        // Update the dropdown state changed
        if (this.state.dropdownOpen !== nextState.dropdownOpen) {
            return true;
        }
        // Update if the mincount is different
        else if (this.props.panel.subPanels[this.props.index].minimumCount !== nextProps.panel.subPanels[nextProps.index].minimumCount) {
            return true;
        }
        // Else don't update
        return false;
    }
    
    public toggle() {
        this.setState((prevState: any) => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    public selectItem(item: any) {
        const text: string = item.target.innerText;
        const val: number = +text.replace('At Least ','').replace('x','').trim();

        // Update state
        this.props.dispatch(setSubPanelCount(this.props.panel.index, this.props.index, val));
    }

    public render() {
        const minCount = this.props.panel.subPanels[this.props.index].minimumCount;
        const items = new Array(10).fill(null).map((val: any, i: number) => {
            const classes = `leaf-dropdown-item ${minCount === (i + 1) ? 'selected' : ''}`;
            return <DropdownItem className={classes} key={i} onClick={this.selectItem}>At Least {i + 1}x</DropdownItem>
        });

        return (
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle} className="panel-header-count">
                <DropdownToggle caret={true}>
                    At Least {minCount}x
                </DropdownToggle>
                <DropdownMenu>
                    {items}
                </DropdownMenu>
            </Dropdown>
        );
    }
}