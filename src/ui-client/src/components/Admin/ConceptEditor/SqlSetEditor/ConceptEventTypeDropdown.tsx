/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu, FormGroup } from 'reactstrap';
import { ConceptEvent } from '../../../../models/admin/Concept';
import { FaChevronDown } from 'react-icons/fa';
import Label from 'reactstrap/lib/Label';

interface Props {
    currentType?: ConceptEvent;
    changeHandler: (val: any, propName: string) => any;
    eventTypes: ConceptEvent[];
}

interface State {
    isOpen: boolean;
}

export class ConceptEventTypeDropdown extends React.PureComponent<Props,State> {
    private className = 'concept-editor';
    private propName = 'eventId';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { currentType, eventTypes } = this.props;
        const { isOpen } = this.state;
        const c = this.className;
        const display = currentType ? currentType.uiDisplayEventName : 'None';

        return (
            <FormGroup>
                <Label>Event Type</Label>
                <div className={`${c}-dropdown ${c}-concept-event-dropdown`}>
                    <Dropdown isOpen={isOpen} toggle={this.toggle}>
                        <DropdownToggle>
                            {display}
                            <FaChevronDown className={`${c}-dropdown-chevron`}/>
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem>
                                <div className={`${c}-concept-event`} onClick={this.handleNoneDropdownItemClick}>None</div>
                            </DropdownItem>
                            <DropdownItem divider={true}/>
                            {eventTypes.map((ev) => (
                            <DropdownItem>
                                <div className={`${c}-concept-event`} key={ev.id} onClick={this.handleDropdownItemClick.bind(null, ev.id)}>{ev.uiDisplayEventName}</div>
                            </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </FormGroup>
        );
    }

    private toggle = () => {
        const { isOpen } = this.state;
        this.setState({ isOpen: !isOpen })
    }

    private handleNoneDropdownItemClick = () => {
        const { changeHandler } = this.props;
        changeHandler(null, this.propName);
    }

    private handleDropdownItemClick = (eventType: number | null) => {
        const { changeHandler } = this.props;
        changeHandler(eventType, this.propName);
    }
};
