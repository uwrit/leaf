/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { TextArea } from '../Sections/TextArea';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { setAdminConceptSpecialization, deleteAdminConceptSpecialization, saveOrUpdateAdminSpecialization, removeAdminConceptSpecialization } from '../../../../actions/admin/specialization';
import { showConfirmationModal } from '../../../../actions/generalUi';
import { Specialization, SpecializationGroup } from '../../../../models/admin/Concept';
import { AdminPanelQueuedApiEvent, AdminPanelUpdateObjectType } from '../../../../models/state/AdminState';
import { upsertAdminApiQueuedEvent, removeAdminApiQueuedEvent } from '../../../../actions/admin/sqlSet';
import { Row, Col, Container } from 'reactstrap';
import { Input } from '../Sections/Input';
import { saveOrUpdateAdminConceptSpecializationGroup } from '../../../../actions/admin/specializationGroup';

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
        const c = this.className;
        return (
            <Container>
                <Row className={`${c}-specializationgroup-specialization`} key={specialization.id}>

                    {specialization.unsaved &&
                    <span className={`${c}-unsaved`}>unsaved!</span>
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
        const { dispatch, specialization, group } = this.props;
        const newSpc = Object.assign({}, specialization, { [propName]: val === '' ? null : val });

        /*
         * If the parent Specialization Group is unsaved, this specialization 
         * will be saved along with it. Else this specialization needs to be
         * saved/updated in its own API call.
         */
        if (group.unsaved) {
            group.specializations.set(newSpc.id, newSpc);
            const apiSaveEvent: AdminPanelQueuedApiEvent = {
                getProcess: () => saveOrUpdateAdminConceptSpecializationGroup(group),
                id: group.id,
                objectType: AdminPanelUpdateObjectType.SPECIALIZATION_GROUP
            }
            dispatch(upsertAdminApiQueuedEvent(apiSaveEvent))
        } else {
            const apiSaveEvent: AdminPanelQueuedApiEvent = {
                getProcess: () => saveOrUpdateAdminSpecialization(newSpc),
                id: newSpc.id,
                objectType: AdminPanelUpdateObjectType.SPECIALIZATION
            }
            dispatch(upsertAdminApiQueuedEvent(apiSaveEvent))
        }

        dispatch(setAdminConceptSpecialization(newSpc, true));
    }

    private handleDeleteSpecializationClick = () => {
        const { dispatch, specialization } = this.props;

        if (specialization.unsaved) {
            dispatch(removeAdminApiQueuedEvent(specialization.id));
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
