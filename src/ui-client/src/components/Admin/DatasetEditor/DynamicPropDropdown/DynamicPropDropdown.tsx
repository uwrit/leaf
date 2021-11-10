/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Label, FormText, DropdownToggle } from 'reactstrap';
import { FaChevronDown } from 'react-icons/fa';
import { Dropdown as BSDropdown, DropdownMenu, DropdownItem } from 'reactstrap'

interface Props {
    clickHandler: (val: string, prop: string) => any;
    label: string;
    options: string[];
    prop: string;
    required?: boolean;
    selected?: string;
    sublabel?: string;
    locked?: boolean;
}

interface State {
    isOpen: boolean;
}

export class DynamicPropDropdown extends React.PureComponent<Props,State> {
    private className = 'admin-panel-dropdown';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { clickHandler, options, selected, locked, label, prop, required, sublabel } = this.props;
        const { isOpen } = this.state;
        const c = this.className;

        return (
            <FormGroup>
                <Label>
                    {label}
                    {required &&
                    <span className='required'>*</span>
                    }
                    {sublabel &&
                        <FormText color="muted">{sublabel}</FormText>
                    }
                </Label>
                <div className={c} tabIndex={0}>
                    <BSDropdown isOpen={isOpen} toggle={this.toggle} className={c}>
                        <DropdownToggle disabled={locked}>
                            <div>
                                {selected}
                                <FaChevronDown className={`${c}-chevron`}/>
                            </div>
                        </DropdownToggle>
                        <DropdownMenu>
                            <div className={`${c}-item-container`}>

                                <DropdownItem onClick={clickHandler.bind(null, '', prop)}>
                                    None
                                </DropdownItem>
                                <DropdownItem divider={true} />
                                
                                {/* Options */}
                                {options.map((o) => {
                                    return (
                                        <DropdownItem 
                                            key={o}
                                            onClick={clickHandler.bind(null, o, prop)}>
                                            {o}
                                        </DropdownItem>
                                    );
                                })}
                            </div>
                        </DropdownMenu>
                    </BSDropdown>
                </div>
            </FormGroup>
        );
    }
    private toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }
};
