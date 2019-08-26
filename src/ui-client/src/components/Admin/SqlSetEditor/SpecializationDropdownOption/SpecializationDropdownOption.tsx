/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { TextArea } from '../../Section/TextArea';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { setAdminConceptSpecialization, deleteAdminConceptSpecialization, removeAdminConceptSpecialization } from '../../../../actions/admin/specialization';
import { showConfirmationModal } from '../../../../actions/generalUi';
import { Specialization, SpecializationGroup } from '../../../../models/admin/Concept';
import { Row, Col, Container } from 'reactstrap';

interface Props {
    dispatch: any;
    group: SpecializationGroup;
    forceValidation: boolean;
    specialization: Specialization;
}

export class SpecializationDropdownOption extends React.PureComponent<Props> {
    private uidBase = 'urn:leaf:specialization:';
    private className = 'sqlset-editor';

    public render() {
        const { specialization, forceValidation } = this.props;
        const unsaved = specialization.unsaved || specialization.changed;
        const c = this.className;
        const uid = specialization.universalId
            ? specialization.universalId.replace(this.uidBase,'')
            : '';
        return (
            <Container>
                <Row className={`${c}-specializationgroup-specialization ${unsaved ? 'unsaved' : ''}`} key={specialization.id}>

                    {/* Unsaved notifier */}
                    {unsaved &&
                    <span className={`${c}-unsaved`}>unsaved</span>
                    }

                    {/* UniversalId */}
                    <Col className={`${c}-input-container`} md={4}>
                        <TextArea
                            changeHandler={this.handleUniversalIdChange} propName={'universalId'} value={uid} className={`${c}-specialization-universalid`}
                        />
                    </Col>

                    {/* Text */}
                    <Col className={`${c}-input-container`} md={4}>
                        <TextArea
                            changeHandler={this.handleDropdownOptionEdit} propName={'uiDisplayText'} value={specialization.uiDisplayText}
                            required={true} errorText='Enter Text to display' forceValidation={forceValidation}
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
                            required={true} errorText='Enter a valid SQL WHERE clause' forceValidation={forceValidation}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }

    private handleUniversalIdChange = (val: any, propName: string) => {
        let value = val;
        if (value && !value.startsWith(this.uidBase)) {
            value = this.uidBase + val;
        } else if (!value || value === this.uidBase) {
            value = null;
        }
        this.handleDropdownOptionEdit(value, propName);
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
