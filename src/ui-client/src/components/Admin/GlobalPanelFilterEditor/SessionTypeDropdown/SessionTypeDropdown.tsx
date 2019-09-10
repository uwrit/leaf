/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Label, FormText, DropdownToggle } from 'reactstrap';
import { FaChevronDown } from 'react-icons/fa';
import { Dropdown as BSDropdown, DropdownMenu, DropdownItem } from 'reactstrap'
import { GlobalPanelFilter, SessionType } from '../../../../models/admin/GlobalPanelFilter';

interface Props {
    changeHandler: (val: any, propName: string) => any;
    globalPanelFilter: GlobalPanelFilter;
}

interface State {
    isOpen: boolean;
}

export class SessionTypeDropdown extends React.PureComponent<Props,State> {
    private className = 'global-panelfilter-editor-accessmode';
    private propName = 'sessionType';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { sessionType } = this.props.globalPanelFilter;
        const { isOpen } = this.state;
        const c = this.className;
        const displayText = sessionType
            ? sessionType === SessionType.QI ? 'QI' : 'Research' 
            : 'Both QI and Research';

        return (
            <FormGroup>
                <Label>
                    Access Mode
                    <span className='required'>*</span>
                </Label>
                <div className={`admin-panel-dropdown`} tabIndex={0}>
                    <BSDropdown isOpen={isOpen} toggle={this.toggle} className={c}>
                        <DropdownToggle>
                            <div>
                                {displayText} 
                                <FaChevronDown className={`admin-panel-dropdown-chevron`}/>
                            </div>
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem 
                                onClick={this.handleChange.bind(null, SessionType.QI)}
                                className={`${c}-option ${sessionType === SessionType.QI ? 'selected' : ''}`}>
                                Quality Improvement (QI)
                            </DropdownItem>
                            <DropdownItem 
                                onClick={this.handleChange.bind(null, SessionType.Research)}
                                className={`${c}-option ${sessionType === SessionType.Research ? 'selected' : ''}`}>
                                Research
                            </DropdownItem>
                            <DropdownItem 
                                onClick={this.handleChange.bind(null, undefined)}
                                className={`${c}-option ${sessionType === undefined ? 'selected' : ''}`}>
                                Both QI and Research
                            </DropdownItem>
                        </DropdownMenu>
                    </BSDropdown>
                </div>
                <FormText color="muted">
                    Determines whether the filter should be applied to user queries for QI, Research, or both.
                </FormText>
            </FormGroup>
        );
    }

    private handleChange = (mode?: SessionType) => {
        const { changeHandler } = this.props;
        changeHandler(mode, this.propName);
    }

    private toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }
};
