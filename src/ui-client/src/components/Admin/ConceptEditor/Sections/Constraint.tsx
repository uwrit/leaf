/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu, FormGroup } from 'reactstrap';
import { ConstraintType, Constraint as ConstraintModel } from '../../../../models/admin/Concept';
import { TextArea } from '../../Section/TextArea';
import { FaChevronDown } from 'react-icons/fa';

interface Props {
    changeHandler: (idx: number, newConstraint: ConstraintModel) => any;
    deleteHandler: (idx: number) => any;
    constraint: ConstraintModel;
    index: number;
    forceValidation: boolean;
}

interface State {
    isOpen: boolean;
}

export class Constraint extends React.PureComponent<Props,State> {
    private className = 'concept-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { constraint, forceValidation } = this.props;
        const { isOpen } = this.state;
        const c = this.className;
        const placeholder = forceValidation && !constraint.constraintValue
            ? 'Enter a valid name'
            : '';

        return (
            <FormGroup>
                <div className={`admin-panel-dropdown ${c}-constraint-dropdown`}>
                    <Dropdown isOpen={isOpen} toggle={this.toggle}>
                        <DropdownToggle>
                            {constraint.constraintId === ConstraintType.User ? 'User' : 'Group'}
                            <FaChevronDown className={`admin-panel-dropdown-chevron`}/>
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem>
                                <div className={`${c}-constraint`} onClick={this.handleUserDropdownClick}>User</div>
                            </DropdownItem>
                            <DropdownItem>
                                <div className={`${c}-constraint`} onClick={this.handleGroupDropdownClick}>Group</div>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <TextArea 
                        changeHandler={this.handleConstraintValueChange} propName={'constraintValue'} 
                        value={constraint.constraintValue} required={true} placeholder={placeholder}
                    />
                    <div className={`${c}-constraint-delete`} onClick={this.handleDeleteClick}>
                        <span>Delete</span>
                    </div>
                </div>
            </FormGroup>
        );
    }

    private toggle = () => {
        const { isOpen } = this.state;
        this.setState({ isOpen: !isOpen })
    }

    private handleDeleteClick = () => {
        const { deleteHandler, index } = this.props;
        deleteHandler(index);
    }

    private handleConstraintValueChange = (val: string, propName: string) => {
        const { changeHandler, constraint, index } = this.props;
        const newConstraint = Object.assign({}, constraint, { [propName]: val });
        changeHandler(index, newConstraint);
    }

    private handleDropdownItemClick = (type: ConstraintType) => {
        const { changeHandler, constraint, index } = this.props;
        const newConstraint = Object.assign({}, constraint, { constraintId: type });
        changeHandler(index, newConstraint);
    }

    private handleUserDropdownClick = () => this.handleDropdownItemClick(ConstraintType.User)

    private handleGroupDropdownClick = () => this.handleDropdownItemClick(ConstraintType.Group)
};
