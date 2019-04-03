/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { TextArea } from '../Sections/TextArea';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { setAdminConceptSpecialization, deleteAdminConceptSpecialization, removeAdminConceptSpecialization } from '../../../../actions/admin/specialization';
import { showConfirmationModal } from '../../../../actions/generalUi';
import { Specialization, SpecializationGroup } from '../../../../models/admin/Concept';
import { Row, Col, Container } from 'reactstrap';
import { Input } from '../Sections/Input';

interface Props {
    dispatch: any;
    group: SpecializationGroup;
    specialization: Specialization;
}

export class SpecializationDropdownOption extends React.PureComponent<Props> {
    private className = 'sqlset-editor';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { specialization } = this.props;
        const unsaved = specialization.unsaved || specialization.changed;
        const c = this.className;
        return (
            <Container>
                <Row className={`${c}-specializationgroup-specialization ${unsaved ? 'unsaved' : ''}`} key={specialization.id}>

                    {/* Unsaved notifier */}
                    {unsaved &&
                    <span className={`${c}-unsaved`}>unsaved</span>
                    }

                    {/* UniversalId */}
                    <Col className={`${c}-input-container`} md={4}>

                        <Input
                            changeHandler={this.handleDropdownOptionEdit} propName={'universalId'} value={specialization.universalId}
                        />
                    </Col>

                    {/* Text */}
                    <Col className={`${c}-input-container`} md={4}>
                        <TextArea
                            changeHandler={this.handleDropdownOptionEdit} propName={'uiDisplayText'} value={specialization.uiDisplayText}
                        />
                    </Col>

                    {/* SQL */}
                    <Col className={`${c}-input-container`} md={4}>

                        {/* Delete Specialization button */}
                        <div className={`${c}-specializationgroup-delete`}>
                            <span onClick={this.handleDeleteSpecializationClick}>Delete</span>
                        </div>

                        <TextArea
                            changeHandler={this.handleDropdownOptionEdit} propName={'sqlSetWhere'} value={specialization.sqlSetWhere}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }

    private handleDropdownOptionEdit = (val: any, propName: string) => {
        const { dispatch, specialization } = this.props;
        const newSpc = Object.assign({}, specialization, { [propName]: val, changed: true });
        dispatch(setAdminConceptSpecialization(newSpc, true));
    }

    private handleDeleteSpecializationClick = () => {
        const { dispatch, specialization } = this.props;

        if (specialization.unsaved) {
            dispatch(removeAdminConceptSpecialization(specialization));
        } else {
            const confirm: ConfirmationModalState = {
                body: `Are you sure you want to delete this dropdown option (id "${specialization.id}")? This can't be undone.`,
                header: 'Delete Specialization Dropdown Option',
                onClickNo: () => null,
                onClickYes: () => dispatch(deleteAdminConceptSpecialization(specialization)),
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Delete Dropdown Option`
            };
            dispatch(showConfirmationModal(confirm));
        }
    }
};
