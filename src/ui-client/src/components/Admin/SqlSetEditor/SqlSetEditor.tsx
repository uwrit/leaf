/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConceptSqlSet, ConceptEvent } from '../../../models/admin/Concept';
import { Button } from 'reactstrap';
import { setAdminConceptSqlSet, undoAdminSqlSetChanges, processApiUpdateQueue } from '../../../actions/admin/sqlSet';
import { SqlSetRow } from './SqlSetRow/SqlSetRow';
import { InformationModalState, ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { showInfoModal, showConfirmationModal } from '../../../actions/generalUi';
import AdminState, { AdminPanelPane } from '../../../models/state/AdminState';
import { checkIfAdminPanelUnsavedAndSetPane } from '../../../actions/admin/admin';
import { FiCornerUpLeft } from 'react-icons/fi';
import './SqlSetEditor.css';

interface Props {
    data: AdminState;
    dispatch: any;
}

interface State {
    forceValidation: boolean;
}

export class SqlSetEditor extends React.PureComponent<Props,State> {
    private className = 'sqlset-editor';
    private bottomDivRef: any = React.createRef();
    constructor(props: Props) {
        super(props);
        this.state = {
            forceValidation: false
        }
    }

    public render() {
        const { data, dispatch } = this.props;
        const { forceValidation } = this.state;
        const c = this.className;
        const evs: ConceptEvent[] = [ ...data.conceptEvents.events.values() ];
        
        return (
            <div className={`${c}-container admin-panel-editor`}>

                {/* Header */}
                <div className={`${c}-toprow`}>
                    <Button className='leaf-button leaf-button-addnew' onClick={this.handleAddSqlSetClick}>
                        + Create New SQL Set
                    </Button>
                    <Button className='leaf-button leaf-button-secondary' disabled={!data.sqlSets.changed} onClick={this.handleUndoChangesClick}>
                        Undo Changes
                    </Button>
                    <Button className='leaf-button leaf-button-primary' disabled={!data.sqlSets.changed} onClick={this.handleSaveChangesClick}>
                        Save
                    </Button>
                    <Button className='leaf-button leaf-button-primary back-to-editor' onClick={this.handleBackToConceptEditorClick}>
                        <FiCornerUpLeft /> 
                        Go to Concept Editor
                    </Button>
                </div>

                {/* Sets */}
                <div className={`${c}-table`}>
                    {[ ...data.sqlSets.sets.values() ]
                        .sort((a,b) => a.id > b.id ? -1 : 1)
                        .map((s) => <SqlSetRow set={s} dispatch={dispatch} key={s.id} state={data} eventTypes={evs} forceValidation={forceValidation} />)
                    }
                    <div ref={this.bottomDivRef}></div>
                </div>
            </div>
        );
    }

    /*
     * Validate that current admin Concept is valid. Called on 'Save' click.
     */
    private currentSqlSetsAreValid = (): boolean => {
        const { sets } = this.props.data.sqlSets;

        for (const set of [ ...sets.values() ]) {
            if (set.changed || set.unsaved) {
                if (!set.sqlSetFrom) { return false; }
                if (set.isEncounterBased && !set.sqlFieldDate) { return false; }
                if (set.isEventBased && !set.eventId) { return false; }
            }
            for (const grp of [ ...set.specializationGroups.values() ]) {
                if (grp.changed || grp.unsaved) {
                    if (!grp.uiDefaultText) { return false; }
                }
                for (const spc of [ ...grp.specializations.values() ]) {
                    if (spc.changed || spc.unsaved) {
                        if (!spc.sqlSetWhere) { return false; }
                        if (!spc.uiDisplayText) { return false; }
                    }
                }
            }
        }
        return true;
    }

    /* 
     * Generate the an integer 1 higher than the max
     * of the current sets.
     */
    private generateSequentialIntegerId = () => {
        const { sets } = this.props.data.sqlSets;
        if (!sets.size) { return 1; }
        const max = Math.max.apply(Math, [ ...sets.values() ].map((s) => s.id));
        return max + 1;
    }

    /*
     * Create a new Concept SQL Set, updating 
     * the store and preparing a later API save event.
     */
    private handleAddSqlSetClick = () => {
        const { dispatch } = this.props;
        const newSet: ConceptSqlSet = {
            id: this.generateSequentialIntegerId(),
            isEncounterBased: false,
            isEventBased: false,
            sqlFieldDate: '',
            sqlSetFrom: '',
            specializationGroups: new Map(),
            unsaved: true
        }
        dispatch(setAdminConceptSqlSet(newSet, true));
    }

    /*
     * Trigger a fallback to the unedited SQL Sets, undoing any current changes.
     */
    private handleUndoChangesClick = () => {
        const { dispatch } = this.props;
        this.setState({ forceValidation: false });
        dispatch(undoAdminSqlSetChanges());
    }

    private handleSaveChangesClick = () => {
        const { dispatch } = this.props;
        const valid = this.currentSqlSetsAreValid();
        if (valid) {
            dispatch(processApiUpdateQueue());
        } else {
            const confirm: ConfirmationModalState = {
                body: `One or more fields in the SQL Set or Dropdowns are missing necessary data. Are you sure you want to save?`,
                header: 'Missing SQL Set data',
                onClickNo: () => null,
                onClickYes: () => { 
                    dispatch(processApiUpdateQueue());
                    this.setState({ forceValidation: false });
                },
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Save SQL Sets`
            };
            dispatch(showConfirmationModal(confirm));
            this.setState({ forceValidation: true });
        }
    }

    private handleBackToConceptEditorClick = () => {
        const { dispatch } = this.props;
        dispatch(checkIfAdminPanelUnsavedAndSetPane(AdminPanelPane.CONCEPTS));
    }
};
