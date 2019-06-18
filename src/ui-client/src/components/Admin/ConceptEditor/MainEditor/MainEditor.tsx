/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row, Col, Button } from 'reactstrap';
import { AdminPanelLoadState, AdminPanelPane } from '../../../../models/state/AdminState';
import LoaderIcon from '../../../Other/LoaderIcon/LoaderIcon';
import { Display } from '../Sections/Display';
import { Identifiers } from '../Sections/Identifiers';
import { Configuration } from '../Sections/Configuration';
import { Concept as AdminConcept, ConceptSqlSet } from '../../../../models/admin/Concept';
import { setAdminConcept, deleteAdminConceptFromServer, revertAdminAndUserConceptChanges, setAdminPanelCurrentUserConcept, removeUnsavedAdminConcept, saveAdminConcept } from '../../../../actions/admin/concept';
import { setConcept, createConcept, setSelectedConcept, removeConcept } from '../../../../actions/concepts';
import { SqlEditor } from '../Sections/SqlEditor';
import { EditorPaneProps as Props, SectionProps } from '../Props';
import { ConfirmationModalState, InformationModalState } from '../../../../models/state/GeneralUiState';
import { showConfirmationModal, showInfoModal } from '../../../../actions/generalUi';
import { Constraints } from '../Sections/Contraints';
import { SpecializationDropdowns } from '../Sections/SpecializationDropdowns';
import { updateUserConceptFromAdminChange, createEmptyConcept } from '../../../../utils/admin/concept';
import { setAdminConceptSqlSet } from '../../../../actions/admin/sqlSet';
import { setAdminPanelPane } from '../../../../actions/admin/admin';

const showConceptStatus = new Set([ AdminPanelLoadState.LOADING, AdminPanelLoadState.LOADED ]);

interface State {
    forceValidation: boolean;
}

export class MainEditor extends React.PureComponent<Props,State> {
    private className = 'concept-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            forceValidation: false
        }
    }

    public render() {
        const { data, dispatch, togglePanelPreview, toggleSqlPreview, toggleOverlay } = this.props;
        const { configuration } = data;
        const { changed, currentAdminConcept, currentUserConcept, state } = data.concepts;
        const { sets } = data.sqlSets
        const c = this.className;
        const sectionProps: SectionProps = {
            adminConcept: currentAdminConcept,
            userConcept: currentUserConcept,
            changed,
            changeHandler: this.handleInputChange,
            dispatch,
            forceValidation: this.state.forceValidation,
            sqlSets: sets,
            sqlConfig: configuration.sql,
            toggleOverlay: toggleOverlay,
            togglePanelPreview: togglePanelPreview,
            toggleSqlPreview: toggleSqlPreview
        };

        return (
            <div className={`${c}-main`}>

                {/* Header */}
                {sets.size > 0 &&
                <div className={`${c}-column-right-header`}>
                    <Button className='leaf-button leaf-button-addnew' disabled={changed} onClick={this.handleAddConceptClick}>
                        + Create New Concept
                    </Button>
                    <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChanges}>
                        Undo Changes
                    </Button>
                    <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveChanges}>
                        Save
                    </Button>
                    <Button className='leaf-button leaf-button-warning' disabled={!currentAdminConcept || state === AdminPanelLoadState.NOT_APPLICABLE} onClick={this.handleDeleteConceptClick}>
                        Delete
                    </Button>
                </div>
                }

                {/* Create a SQL Set link, used at initial setup */}
                {data.state === AdminPanelLoadState.LOADED && sets.size === 0 &&
                <div className={`${c}-start`}>
                    <p>Hi there! It looks like you need to create Concepts to connect to your clinical data.</p>
                    <p>
                        <a onClick={this.handleCreateSqlSetClick}>Start by creating a Concept SQL Set</a>
                        , which is a SQL table, view, or subquery which your Concepts can point to.
                    </p>
                </div>
                }

                {/* Hint to click on a Concept to edit */}
                {!currentAdminConcept && sets.size > 0 &&
                <div className={`${c}-na`}>
                    <p>Click on a Concept to the left to edit <br></br> or <a onClick={this.handleAddConceptClick}>create a new one</a></p>
                </div>
                }

                {/* Main editor */}
                {currentAdminConcept && 
                <div>
                    {this.getStatusDependentContent(state, c)}
                    {showConceptStatus.has(state) &&
                    <Row>
                        <Col md={6} className={`${c}-inner-column-left`}>
                            <Display data={sectionProps}/>
                            <Configuration data={sectionProps}/>
                            <SpecializationDropdowns data={sectionProps} set={sets.get(currentAdminConcept.sqlSetId!)}/>
                        </Col>
                        <Col md={6} className={`${c}-inner-column-right`}>
                            <SqlEditor data={sectionProps} />
                            <Identifiers data={sectionProps} />
                            <Constraints data={sectionProps}/>
                        </Col>
                    </Row>
                    }
                </div>
                }
            </div>
        );
    }

    /* 
     * Set optional content if a edit-able Concept is not selected.
     */
    private getStatusDependentContent = (state: AdminPanelLoadState, c: string) => {
        if (state === AdminPanelLoadState.LOADING) {
            return (
                <div>
                    <div className={`${c}-loading`}>
                        <LoaderIcon size={100} />
                    </div>
                    <div className={`${c}-loading-overlay`}/>
                </div>
            );
        } else if (state === AdminPanelLoadState.NOT_APPLICABLE) {
            return (
                <div className={`${c}-na`}>
                    <p>Saved queries cannot be edited. Please select a normal Leaf concept.</p>
                </div>
            );
        } else if (state === AdminPanelLoadState.ERROR) {
            return (
                <div className={`${c}-error`}>
                    <p>Leaf encountered an error while trying to fetch this concept.</p>
                </div>
            );
        }
        return null;
    }

    /*
     * Validate that current admin Concept is valid. Called on 'Save' click.
     */
    private currentConceptIsValid = (): boolean => {
        const { currentAdminConcept } = this.props.data.concepts;

        if (!currentAdminConcept) { return false; }
        if (!currentAdminConcept.uiDisplayName) { return false; }
        if (!currentAdminConcept.uiDisplayText) { return false; }
        for (const constraint of currentAdminConcept.constraints) {
            if (!constraint.constraintValue) { return false; }
        }
        return true;
    }

    /* 
     * Handle click on initial startup if no SQL Sets exist.
     */
    private handleCreateSqlSetClick = () => {
        const { dispatch } = this.props;
        const newSet: ConceptSqlSet = {
            id: 1,
            isEncounterBased: false,
            isEventBased: false,
            sqlFieldDate: '',
            sqlSetFrom: '',
            specializationGroups: new Map(),
            unsaved: true
        }
        dispatch(setAdminConceptSqlSet(newSet, true));
        dispatch(setAdminPanelPane(AdminPanelPane.SQL_SETS));
    }

    /* 
     * Handle tracking of input changes to the Concept, generating cloned, updated
     * copies of the User and Admin Concepts to the store as edits are made.
     */
    private handleInputChange = (val: any, propName: string) => {
        const { sets } = this.props.data.sqlSets;
        const { currentAdminConcept, currentUserConcept } = this.props.data.concepts;
        const { dispatch } = this.props;
        const newVal = val === '' ? null : val;

        const newConcept = Object.assign({}, currentAdminConcept, { [propName]: newVal }) as AdminConcept;
        const newUserConcept = updateUserConceptFromAdminChange(currentUserConcept!, propName, newVal, sets.get(newConcept!.sqlSetId!));

        dispatch(setAdminConcept(newConcept, true));
        dispatch(setAdminPanelCurrentUserConcept(newUserConcept));
        dispatch(setConcept(newUserConcept));
    }

    /*
     * Trigger a fallback to the unedited Concept, undoing any current changes.
     */
    private handleUndoChanges = () => {
        const { currentAdminConcept, currentUserConcept } = this.props.data.concepts;
        const { dispatch } = this.props;

        if (currentAdminConcept!.unsaved) {
            this.removeUnsavedAdminConcept();
        } else {
            dispatch(revertAdminAndUserConceptChanges(currentAdminConcept!, currentUserConcept!));
        }
        this.setState({ forceValidation: false });
    }

    /*
     * Remove an unedited Admin Concept, basically refreshing the left admin pane.
     */
    private removeUnsavedAdminConcept = () => {
        const { currentUserConcept } = this.props.data.concepts;
        const { dispatch } = this.props;
        dispatch(removeConcept(currentUserConcept!));
        dispatch(removeUnsavedAdminConcept());
    }

    /*
     * Handle initiation of saving async changes and syncing with the DB.
     */
    private handleSaveChanges = () => {
        const { currentAdminConcept, currentUserConcept } = this.props.data.concepts;
        const { dispatch } = this.props;
        const isValid = this.currentConceptIsValid();

        if (isValid) {
            dispatch(saveAdminConcept(currentAdminConcept!, currentUserConcept!));
        } else {
            const confirm: ConfirmationModalState = {
                body: `One or more fields are missing necessary data. Are you sure you want to save this Concept?`,
                header: 'Missing Concept data',
                onClickNo: () => null,
                onClickYes: () => { 
                    dispatch(saveAdminConcept(currentAdminConcept!, currentUserConcept!));
                    this.setState({ forceValidation: false });
                },
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Save Concept`
            };
            dispatch(showConfirmationModal(confirm));
            this.setState({ forceValidation: true });
        }
    }

    /*
     * Create a new unsaved Concept which the admin can immmediately edit and save.
     */
    private handleAddConceptClick = () => {
        const { dispatch } = this.props;
        const { sets } = this.props.data.sqlSets;
        const defaultSet = sets.size ? sets.get(Array.from(sets.keys())[0]) : undefined;

        const { adminConcept, userConcept } = createEmptyConcept();

        if (defaultSet) {
            adminConcept.sqlSetId = defaultSet.id;
            userConcept.isEncounterBased = defaultSet.isEncounterBased;
            userConcept.isEventBased = defaultSet.isEventBased;
        }

        dispatch(createConcept(userConcept));
        dispatch(setSelectedConcept(userConcept));
        dispatch(setAdminPanelCurrentUserConcept(userConcept));
        dispatch(setAdminConcept(adminConcept, true));
    }

    /*
     * Delete a Concept, or warns if their are children under it.
     */
    private handleDeleteConceptClick = () => {
        const { currentAdminConcept, currentUserConcept } = this.props.data.concepts;
        const { dispatch } = this.props;

        if (currentAdminConcept!.unsaved) {
            this.removeUnsavedAdminConcept();
        } else {
            if (currentUserConcept!.childrenIds && currentUserConcept!.childrenIds!.size) {
                const info: InformationModalState = {
                    body: 
                        `The Concept "${currentAdminConcept!.uiDisplayName}" has child Concepts underneath it which depend on it. ` +
                        `Please move or delete the dependent child Concepts first.`,
                    header: "Save or Undo Changes",
                    show: true
                };
                dispatch(showInfoModal(info));
            } else {
                const confirm: ConfirmationModalState = {
                    body: !currentUserConcept!.childrenIds && currentUserConcept!.isParent
                        ? `The Concept "${currentAdminConcept!.uiDisplayName}" may be a parent of Concepts underneath it, and the delete ` +
                          `operation will fail if any are found. Are you sure you want to continue? This will take effect immediately and can't be undone.`
                        : `Are you sure you want to delete the Concept, "${currentAdminConcept!.uiDisplayName}"? This will take effect immediately and can't be undone.`,
                    header: 'Delete Concept',
                    onClickNo: () => null,
                    onClickYes: () => { dispatch(deleteAdminConceptFromServer(currentAdminConcept!, currentUserConcept!)) },
                    show: true,
                    noButtonText: `No`,
                    yesButtonText: `Yes, Delete Concept`
                };
                dispatch(showConfirmationModal(confirm));
            }
        }
    }
}