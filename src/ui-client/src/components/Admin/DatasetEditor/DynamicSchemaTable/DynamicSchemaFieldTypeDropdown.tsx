/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { DropdownToggle, Dropdown as BSDropdown, DropdownMenu, DropdownItem } from 'reactstrap'
import { PatientListColumnType } from '../../../../models/patientList/Column';

interface Props {
    index: number;
    changeHandler: (index: number, type: PatientListColumnType) => any;
    type: PatientListColumnType;
}

interface State {
    isOpen: boolean;
}

export class DynamicSchemaFieldTypeDropdown extends React.PureComponent<Props,State> {
    private className = 'admin-panel-dynamic-type-dropdown';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { changeHandler, index, type } = this.props;
        const { isOpen } = this.state;
        const c = this.className;

        return (
            <BSDropdown isOpen={isOpen} toggle={this.toggle} className={c}>
                <DropdownToggle>
                    <div>
                        {PatientListColumnType[type]}
                        <FaChevronDown className={`${c}-chevron`}/>
                    </div>
                </DropdownToggle>
                <DropdownMenu>
                    <div className={`admin-panel-dropdown ${c}-item-container`}>

                        {/* String */}
                        <DropdownItem onClick={changeHandler.bind(null, index, PatientListColumnType.String )}>
                            String
                        </DropdownItem>

                        {/* Number */}
                        <DropdownItem onClick={changeHandler.bind(null, index, PatientListColumnType.Numeric )}>
                            Number
                        </DropdownItem>

                        {/* Date */}
                        <DropdownItem onClick={changeHandler.bind(null, index, PatientListColumnType.DateTime )}>
                            Date
                        </DropdownItem>

                        {/* Bool */}
                        <DropdownItem onClick={changeHandler.bind(null, index, PatientListColumnType.Bool )}>
                            Boolean
                        </DropdownItem>

                    </div>
                </DropdownMenu>
            </BSDropdown>
        );
    }

    private toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }
};
