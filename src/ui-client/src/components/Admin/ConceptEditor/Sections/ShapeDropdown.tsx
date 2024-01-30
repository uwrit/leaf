/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, DropdownToggle } from 'reactstrap';
import { FaChevronDown } from 'react-icons/fa';
import { Dropdown as BSDropdown, DropdownMenu, DropdownItem } from 'reactstrap'
import { PatientListDatasetShape } from '../../../../models/patientList/Dataset';

interface Props {
    clickHandler: (shape: PatientListDatasetShape) => any;
    selected: PatientListDatasetShape;
}

interface State {
    isOpen: boolean;
}

export class ShapeDropdown extends React.PureComponent<Props,State> {
    private className = 'concept-editor';
    private shapes: [PatientListDatasetShape, string][] = [
        [ PatientListDatasetShape.Allergy, 'Allergy' ],
        [ PatientListDatasetShape.Condition, 'Condition' ],
        [ PatientListDatasetShape.Encounter, 'Encounter' ],
        [ PatientListDatasetShape.Immunization, 'Immunization' ],
        [ PatientListDatasetShape.MedicationAdministration, 'MedAdmin' ],
        [ PatientListDatasetShape.MedicationRequest, 'MedRequest' ],
        [ PatientListDatasetShape.Observation, 'Observation' ],
        [ PatientListDatasetShape.Patient, 'Patient' ],
        [ PatientListDatasetShape.Person, 'Person' ]
    ];

    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { clickHandler, selected } = this.props;
        const { isOpen } = this.state;
        const c = this.className;

        return (
            <FormGroup>
                <div className={`admin-panel-dropdown`} tabIndex={0}>
                    <BSDropdown isOpen={isOpen} toggle={this.toggle} className={c}>
                        <DropdownToggle>
                            <div>
                                {this.getDisplayName(selected)} 
                                <FaChevronDown className={`admin-panel-dropdown-chevron`}/>
                            </div>
                        </DropdownToggle>
                        <DropdownMenu>
                            <div className={`admin-panel-dropdown-item-container`}>
                                
                                {/* FHIR Template shapes */}
                                {this.shapes.map((s) => {
                                    var [shape, name] = s;
                                    return (
                                        <DropdownItem 
                                            key={shape}
                                            onClick={clickHandler.bind(null, shape)}>
                                            {name}
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

    private getDisplayName = (shape?: PatientListDatasetShape): string => {
        if (typeof shape === 'undefined') return '';
        return `/ ${PatientListDatasetShape[shape]} ?`;
    }

    private toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    }
};
