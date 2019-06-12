/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConceptSqlSet, ConceptEvent } from '../../../../models/admin/Concept';
import { Button, Container } from 'reactstrap';
import { checkIfAdminPanelUnsavedAndSetSubPane } from '../../../../actions/admin/admin';
import { AdminPanelConceptEditorPane } from '../../../../models/state/AdminState';
import { setAdminConceptSqlSet, setAdminUneditedConceptSqlSets, undoAdminSqlSetChanges, processApiUpdateQueue } from '../../../../actions/admin/sqlSet';
import { EditorPaneProps as Props } from '../Props';
import { conceptEditorValid } from '../../../../utils/admin/concept';
import { SqlSetRow } from './SqlSetRow';
import { InformationModalState } from '../../../../models/state/GeneralUiState';
import { showInfoModal } from '../../../../actions/generalUi';
import './SqlSetEditor.css';

export class SqlSetEditor extends React.PureComponent<Props> {
    private className = 'sqlset-editor';
    constructor(props: Props) {
        super(props);
    }

    public componentDidMount() {
        const { dispatch, data } = this.props;
        const { sets } = data.sqlSets;
        const firstSet = sets.get(Array.from(sets.keys())[0]);

        if (sets.size === 1 && firstSet!.unsaved) {
            dispatch(setAdminUneditedConceptSqlSets(new Map()));
        } else {
            dispatch(setAdminUneditedConceptSqlSets(data.sqlSets.sets));
        }
    }

    public render() {
        const { data, dispatch } = this.props;
        const c = this.className;
        const evs: ConceptEvent[] = [ ...data.conceptEvents.events.values() ];
        
        return (
            <div className={`${c}-container`}>
                <div className={`${c}-toprow`}>
                    <Button className='leaf-button leaf-button-addnew' onClick={this.handleAddSqlSetClick}>+ Create New SQL Set</Button>
                    <Button className='leaf-button leaf-button-secondary' disabled={!data.sqlSets.changed} onClick={this.handleUndoChangesClick}>Undo Changes</Button>
                    <Button className='leaf-button leaf-button-primary' disabled={!data.sqlSets.changed} onClick={this.handleSaveChangesClick}>Save</Button>
                    <Button className='leaf-button leaf-button-primary back-to-editor' onClick={this.handleBackToConceptEditorClick}>Back to Concept Editor</Button>
                </div>
                <Container className={`${c}-table`}>
                    {[ ...data.sqlSets.sets.values() ]
                        .sort((a,b) => a.id > b.id ? 1 : -1)
                        .map((s) => <SqlSetRow set={s} dispatch={dispatch} key={s.id} state={data} eventTypes={evs}/>)
                    }
                </Container>
            </div>
        );
    }

    private generateRandomIntegerId = () => {
        const { sets } = this.props.data.sqlSets;

        /* 
         * Ensure the value is greater than the max set id so it appears sorted below it.
         */
        const min = sets.size > 0
            ? Math.max.apply(Math, [ ...sets.values() ].map((s) => s.id)) 
            : 1;
        const max = 10000;
        return Math.ceil(Math.random() * (max - min) + min);
    }

    /*
     * Create a new Concept SQL Set, updating 
     * the store and preparing a later API save event.
     */
    private handleAddSqlSetClick = () => {
        const { dispatch } = this.props;
        const newSet: ConceptSqlSet = {
            id: this.generateRandomIntegerId(),
            isEncounterBased: false,
            isEventBased: false,
            sqlFieldDate: '',
            sqlSetFrom: '',
            specializationGroups: new Map(),
            unsaved: true
        }
        dispatch(setAdminConceptSqlSet(newSet, true));
    }

    private handleUndoChangesClick = () => {
        const { dispatch } = this.props;
        dispatch(undoAdminSqlSetChanges());
    }

    private handleSaveChangesClick = () => {
        const { dispatch } = this.props;
        const valid = conceptEditorValid();
        if (valid) {
            dispatch(processApiUpdateQueue());
        } else {
            const info: InformationModalState = {
                body: "One or more validation errors were found, and are highlighted in red below. Please fill in data for these before saving changes.",
                header: "Validation Error",
                show: true
            };
            dispatch(showInfoModal(info));
        }
    }

    private handleBackToConceptEditorClick = () => {
        const { dispatch } = this.props;
        dispatch(checkIfAdminPanelUnsavedAndSetSubPane(AdminPanelConceptEditorPane.MAIN));
    }
};
