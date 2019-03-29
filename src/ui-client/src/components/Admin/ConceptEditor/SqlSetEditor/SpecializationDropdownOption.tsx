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
            <div className={`${c}-specializationgroup-specialization`} key={specialization.id}>

                {/* Text */}
                <div className={`${c}-input-container left`}>
                    <TextArea
                        changeHandler={this.handleDropdownOptionEdit} propName={'uiDisplayText'} value={specialization.uiDisplayText} 
                        subLabel='Text'
                    />
                </div>

                {/* SQL */}
                <div className={`${c}-input-container right`}>

                    {/* Delete Specialization button */}
                    <div className={`${c}-specializationgroup-delete`}>
                        <span onClick={this.handleDeleteSpecializationClick}>Delete</span>
                    </div>
                    <TextArea
                        changeHandler={this.handleDropdownOptionEdit} propName={'sqlSetWhere'} value={specialization.sqlSetWhere} 
                        subLabel='SQL'    
                    />
                </div>
            </div>
        );
    }

    private handleDropdownOptionEdit = (val: any, propName: string) => {
        const { dispatch, specialization, group } = this.props;
        const newSpc = Object.assign({}, specialization, { [propName]: val });

        /*
         * If the parent Specialization Group is unsaved, this specialization 
         * will be saved along with it. Else this specialization needs to be
         * saved/updated in its own API call.
         */
        if (!group.unsaved) {
            const apiSaveEvent: AdminPanelQueuedApiEvent = {
                event: () => { dispatch(saveOrUpdateAdminSpecialization(newSpc)) },
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
            dispatch(removeAdminConceptSpecialization(specialization));
            dispatch(removeAdminApiQueuedEvent(specialization.id));
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
