/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { TextArea } from '../../Section/TextArea';
import { SpecializationGroup, Specialization } from '../../../../models/admin/Concept';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { removeAdminConceptSpecializationGroup, deleteAdminConceptSpecializationGroup, setAdminConceptSpecializationGroup } from '../../../../actions/admin/specializationGroup';
import { showConfirmationModal } from '../../../../actions/generalUi';
import { setAdminConceptSpecialization } from '../../../../actions/admin/specialization';
import { SpecializationDropdownOption } from '../SpecializationDropdownOption/SpecializationDropdownOption';
import { generate as generateId } from 'shortid';
import { Row, Col, Container } from 'reactstrap';

interface Props {
    changeHandler: (val: any, propName: string) => any;
    dispatch: any;
    forceValidation: boolean;
    specializationGroup: SpecializationGroup;
}

export class SpecializationGroupDropdownPreview extends React.PureComponent<Props> {
    private className = 'sqlset-editor';

    public render() {
        const { specializationGroup, dispatch, forceValidation } = this.props;
        const c = this.className;
        const unsaved = specializationGroup.unsaved || specializationGroup.changed;
        const spcs: Specialization[] = [];
        specializationGroup.specializations.forEach((s) => spcs.push(s));

        return (
            <div className={`${c}-specializationgroup-container ${unsaved ? 'unsaved' : ''}`}>

                {/* Unsaved notifier */}
                {unsaved &&
                <span className={`${c}-unsaved`}>unsaved</span>
                }
                
                {/* Delete Group button */}
                <div className={`${c}-specializationgroup-delete`}>
                    <span onClick={this.handleDeleteSpecializationGroupClick}>Delete</span>
                </div>

                {/* Default text */}
                <div className={`${c}-specializationgroup-default`}>
                    <TextArea 
                        changeHandler={this.handleSpecializationGroupEdit} propName={'uiDefaultText'} value={specializationGroup.uiDefaultText} 
                        label=' ' subLabel='Default Text' required={true} errorText='Enter a Default Name to display' forceValidation={forceValidation}
                    />
                </div>

                {/* Specializations Header */}
                <Container>
                    <Row className={`${c}-specialization-header`}>
                        <Col md={4}>UniversalId</Col>
                        <Col md={4}>Text</Col>
                        <Col md={4}>SQL WHERE</Col>
                    </Row>
                </Container>
                
                {/* Specializations */}
                {spcs.sort(this.sortSpecializations).map((s) => (
                    <SpecializationDropdownOption dispatch={dispatch} specialization={s} key={s.id} group={specializationGroup} forceValidation={forceValidation}/>
                ))}

                {/* Add Specialization Button */}
                <div className={`${c}-add-specialization-container`}>
                    <div className={`${c}-add-specialization`} onClick={this.handleAddSpecializationClick}>
                        <span>+Add Dropdown Option</span>
                    </div>
                </div>
            </div>
        );
    }

    private sortSpecializations = (a: Specialization, b: Specialization): number => {
        if (!a.orderId && !b.orderId) { return 1; }
        if (a.orderId && !b.orderId)  { return 1; }
        if (!a.orderId && b.orderId)  { return -1; }
        if (a.orderId! >= b.orderId!) { return 1; }
        return -1;
    }

    /*
     * Handle any edits to a specialization group, updating 
     * the store and preparing a later API save event.
     */
    private handleSpecializationGroupEdit = (val: any, propName: string) => {
        const { dispatch, specializationGroup } = this.props;
        const newGrp = Object.assign({}, specializationGroup, { [propName]: val, changed: true });
        dispatch(setAdminConceptSpecializationGroup(newGrp));
    }

    /*
     * Create a new specialization group, updating 
     * the store and preparing a later API save event.
     */
    private handleAddSpecializationClick = () => {
        const { specializationGroup, dispatch } = this.props;
        const newSpc: Specialization = {
            id: generateId(),
            orderId: specializationGroup.specializations.size + 1,
            sqlSetId: specializationGroup.sqlSetId,
            specializationGroupId: specializationGroup.id,
            sqlSetWhere: '',
            uiDisplayText: '',
            unsaved: true
        }
        dispatch(setAdminConceptSpecialization(newSpc, true));
    }

    /*
     * Handle the deletion of a specialization group. If unsaved it
     * is removed directly, else the user is prompted for confirmation.
     */
    private handleDeleteSpecializationGroupClick = () => {
        const { specializationGroup, dispatch } = this.props;

        if (specializationGroup.unsaved) {
            dispatch(removeAdminConceptSpecializationGroup(specializationGroup));
        } else {    
            const confirm: ConfirmationModalState = {
                body: `Are you sure you want to delete this dropdown (id "${specializationGroup.id}")? This can't be undone.`,
                header: 'Delete Specialization Dropdown',
                onClickNo: () => null,
                onClickYes: () => dispatch(deleteAdminConceptSpecializationGroup(specializationGroup)),
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Delete Dropdown`
            };
            dispatch(showConfirmationModal(confirm));
        }
    }
};
