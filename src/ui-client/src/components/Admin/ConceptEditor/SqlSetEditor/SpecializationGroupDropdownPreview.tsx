/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { TextArea } from '../Sections/TextArea';
import { SpecializationGroup, Specialization } from '../../../../models/admin/Concept';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { removeAdminConceptSpecializationGroup, deleteAdminConceptSpecializationGroup, saveOrUpdateAdminConceptSpecializationGroup, setAdminConceptSpecializationGroup } from '../../../../actions/admin/specializationGroup';
import { showConfirmationModal } from '../../../../actions/generalUi';
import { setAdminConceptSpecialization, saveOrUpdateAdminSpecialization } from '../../../../actions/admin/specialization';
import { AdminPanelQueuedApiEvent, AdminPanelUpdateObjectType } from '../../../../models/state/AdminState';
import { SpecializationDropdownOption } from './SpecializationDropdownOption';
import { generate as generateId } from 'shortid';
import { upsertAdminApiQueuedEvent, removeAdminApiQueuedEvent } from '../../../../actions/admin/sqlSet';

interface Props {
    changeHandler: (val: any, propName: string) => any;
    dispatch: any;
    specializationGroup: SpecializationGroup;
}

export class SpecializationGroupDropdownPreview extends React.PureComponent<Props> {
    private className = 'sqlset-editor';
    constructor(props: Props) {
        super(props);
    }

    

    public render() {
        const { specializationGroup, dispatch } = this.props;
        const c = this.className;
        const spcs: Specialization[] = [];
        specializationGroup.specializations.forEach((s) => spcs.push(s));

        return (
            <div className={`${c}-specializationgroup-container`}>
                
                {/* Delete Group button */}
                <div className={`${c}-specializationgroup-delete`}>
                    <span onClick={this.handleDeleteSpecializationGroupClick}>Delete</span>
                </div>

                {/* Default text */}
                <div className={`${c}-specializationgroup-default`}>
                    <TextArea 
                        changeHandler={this.handleSpecializationGroupEdit} propName={'uiDefaultText'} value={specializationGroup.uiDefaultText} 
                        subLabel='Default Text'
                    />
                </div>

                {/* Specializations */}
                {spcs.map((s) => <SpecializationDropdownOption dispatch={dispatch} specialization={s} key={s.id} group={specializationGroup} />)}
                <div className={`${c}-add-specialization`} onClick={this.handleAddSpecializationClick}>
                    <span>+Add Dropdown Option</span>
                </div>
            </div>
        );
    }

    /*
     * Create a queued event to upsert a specialization group on save.
     */
    private generateGroupQueuedApiEvent = (grp: SpecializationGroup): AdminPanelQueuedApiEvent => {
        const { dispatch } = this.props;
        return {
            event: () => saveOrUpdateAdminConceptSpecializationGroup(grp),
            id: grp.id,
            objectType: AdminPanelUpdateObjectType.SPECIALIZATION_GROUP
        };
    }

    /*
     * Create a queued event to upsert a specialization on save.
     */
    private generateSpecializationQueuedApiEvent = (spc: Specialization): AdminPanelQueuedApiEvent => {
        const { dispatch } = this.props;
        return {
            event: () => saveOrUpdateAdminSpecialization(spc),
            id: spc.id,
            objectType: AdminPanelUpdateObjectType.SPECIALIZATION
        };
    }

    /*
     * Handle any edits to a specialization group, updating 
     * the store and preparing a later API save event.
     */
    private handleSpecializationGroupEdit = (val: any, propName: string) => {
        const { dispatch, specializationGroup } = this.props;
        const newGrp = Object.assign({}, specializationGroup, { [propName]: val });
        const apiSaveEvent = this.generateGroupQueuedApiEvent(newGrp);

        dispatch(upsertAdminApiQueuedEvent(apiSaveEvent));
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
            sqlSetId: specializationGroup.sqlSetId,
            specializationGroupId: specializationGroup.id,
            sqlSetWhere: '',
            uiDisplayText: '',
            unsaved: true
        }
        dispatch(setAdminConceptSpecialization(newSpc, true));

        if (!specializationGroup.unsaved) {
            const apiSaveEvent = this.generateSpecializationQueuedApiEvent(newSpc);
            dispatch(upsertAdminApiQueuedEvent(apiSaveEvent))
        }
    }

    /*
     * Handle the deletion of a specialization group. If unsaved it
     * is removed directly, else the user is prompted for confirmation.
     */
    private handleDeleteSpecializationGroupClick = () => {
        const { specializationGroup, dispatch } = this.props;

        if (specializationGroup.unsaved) {
            dispatch(removeAdminConceptSpecializationGroup(specializationGroup));
            dispatch(removeAdminApiQueuedEvent(specializationGroup.id));
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
