/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { SpecializationDropdown } from './SpecializationDropdown';
import { ConceptSpecializationGroup } from '../../../../models/concept/Concept';
import { FaChevronDown } from 'react-icons/fa';

interface Props {
    available: ConceptSpecializationGroup[];
    clickHandler: (grp: ConceptSpecializationGroup) => any;
}

interface State {
    isOpen: boolean;
}

export class SpecializationDropdownPicker extends React.PureComponent<Props,State> {
    private className = 'concept-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { available } = this.props;
        const { isOpen } = this.state;
        const c = this.className;

        return (
            <div className={`${c}-dropdown`}>
                <Dropdown isOpen={isOpen} toggle={this.toggle} className={c}>
                    <DropdownToggle>
                        + Add New Dropdown
                        <FaChevronDown className={`${c}-dropdown-chevron`}/>
                    </DropdownToggle>
                    <DropdownMenu>
                        {available.map((grp) => (
                            <DropdownItem key={grp.id} onClick={this.handleClick.bind(null, grp)}>
                                <SpecializationDropdown specializationGroup={grp} />
                            </DropdownItem>
                        ))}
                        {available.length === 0 &&
                            <DropdownItem>No other dropdowns available for this Concept</DropdownItem>
                        }
                    </DropdownMenu>
                </Dropdown>
            </div>
        );
    }

    private toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }

    private handleClick = (grp: ConceptSpecializationGroup) => {
        const { clickHandler } = this.props;
        clickHandler(grp);
    }
};
