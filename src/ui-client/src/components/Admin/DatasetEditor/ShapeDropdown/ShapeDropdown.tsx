/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Label, FormText, DropdownToggle } from 'reactstrap';
import { FaChevronDown } from 'react-icons/fa';
import { Dropdown as BSDropdown, DropdownMenu, DropdownItem } from 'reactstrap'
import { PatientListDatasetShape } from '../../../../models/patientList/Dataset';
import './ShapeDropdown.css';

interface Props {
    dispatch: any;
    clickHandler: (shape: PatientListDatasetShape) => any;
    shapes: PatientListDatasetShape[];
    selected: PatientListDatasetShape;
    locked?: boolean;
}

interface State {
    isOpen: boolean;
}

export class ShapeDropdown extends React.PureComponent<Props,State> {
    private className = 'concept-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { clickHandler, shapes, selected, locked } = this.props;
        const { isOpen } = this.state;
        const c = this.className;

        return (
            <FormGroup>
                <Label>
                    Dataset Template
                    <FormText color="muted">Dynamic or FHIR Resource Shape</FormText>
                </Label>
                <div className={`admin-panel-dropdown`} tabIndex={0}>
                    <BSDropdown isOpen={isOpen} toggle={this.toggle} className={c}>
                        <DropdownToggle disabled={locked}>
                            <div>
                                {PatientListDatasetShape[selected]} 
                                <FaChevronDown className={`admin-panel-dropdown-chevron`}/>
                            </div>
                        </DropdownToggle>
                        <DropdownMenu>
                            <div className={`admin-panel-dropdown-item-container`}>

                                <p className={`admin-panel-subtext`}>
                                    Dynamic datasets allow you to flexibly return a custom SQL query with columns you configure. They cannot be used as federated queries.
                                </p>

                                {/* Dynamic */}
                                <DropdownItem 
                                    onClick={clickHandler.bind(null,PatientListDatasetShape.Dynamic)}>
                                    {PatientListDatasetShape[PatientListDatasetShape.Dynamic]}
                                </DropdownItem>
                                <DropdownItem divider={true} />

                                <p className={`admin-panel-subtext`}>
                                    FHIR-based template datasets require your SQL query to return a specific set of columns.
                                </p>
                                
                                {/* FHIR Template shapes */}
                                {shapes.map((s) => {
                                    return (
                                        <DropdownItem 
                                            key={s}
                                            onClick={clickHandler.bind(null,s)}>
                                            {PatientListDatasetShape[s]}
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
