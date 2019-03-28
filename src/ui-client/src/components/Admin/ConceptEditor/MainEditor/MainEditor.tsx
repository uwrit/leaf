/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row, Col, Button } from 'reactstrap';
import AdminState, { AdminPanelLoadState } from '../../../../models/state/AdminState';
import LoaderIcon from '../../../Other/LoaderIcon/LoaderIcon';
import { Display } from '../Sections/Display';
import { Identifiers } from '../Sections/Identifiers';
import { Configuration } from '../Sections/Configuration';
import { adminToNormalConcept } from '../../../../utils/admin';
import { Concept } from '../../../../models/admin/Concept';
import { setAdminConcept, revertAdminConceptToOriginal, saveAdminConcept, deleteAdminConcept } from '../../../../actions/admin/concept';
import { setConcept } from '../../../../actions/concepts';
import { SqlEditor } from '../Sections/SqlEditor';
import { EditorPaneProps as Props, SectionProps } from '../Props';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../../actions/generalUi';

const showConceptStatus = new Set([ AdminPanelLoadState.LOADING, AdminPanelLoadState.LOADED ]);

export class MainEditor extends React.PureComponent<Props> {
    private className = 'concept-editor';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { data, dispatch, togglePanelPreview, toggleSqlPreview, toggleOverlay } = this.props;
        const { configuration } = data;
        const { changed, currentConcept, state } = data.concepts;
        const { sets } = data.sqlSets
        const c = this.className;
        const sectionProps: SectionProps = {
            changeHandler: this.handleInputChange,
            concept: currentConcept,
            dispatch,
            sqlSets: sets,
            sqlConfig: configuration.sql,
            toggleOverlay: toggleOverlay,
            togglePanelPreview: togglePanelPreview,
            toggleSqlPreview: toggleSqlPreview
        };

        return (
            <div className={`${c}-main`}>
                {showConceptStatus.has(state) &&
                            <div className={`${c}-column-right-header`}>
                                <Button className='leaf-button leaf-button-secondary mr-auto' disabled={!changed} onClick={this.handleUndoChangesClick}>Undo Changes</Button>
                                <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveChangesClick}>Save</Button>
                                <Button className='leaf-button leaf-button-warning' disabled={!currentConcept} onClick={this.handleDeleteConceptClick}>Delete Concept</Button>
                            </div>
                            }
                {!currentConcept &&
                    <div className={`${c}-na`}>
                    <p>Click on a Concept to the left to edit.</p>
                </div>
                }
                {currentConcept && 
                <div>
                    {this.getStatusDependentContent(state, c)}
                    {showConceptStatus.has(state) &&
                    <Row>
                        <Col md={6} className={`${c}-inner-column-left`}>
                            <Display data={sectionProps}/>
                            <Configuration data={sectionProps}/>
                        </Col>
                        <Col md={6} className={`${c}-inner-column-right`}>
                            <SqlEditor data={sectionProps} />
                            <Identifiers data={sectionProps} />
                        </Col>
                    </Row>
                    }
                </div>
                }
            </div>
        );
    }

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

    private handleInputChange = (val: string | number, propName: string) => {
        const { currentConcept, uneditedUiConcept } = this.props.data.concepts;
        const { dispatch } = this.props;

        const newConcept = Object.assign({}, currentConcept, { [propName]: val }) as Concept;
        const newUiConcept = adminToNormalConcept(newConcept, uneditedUiConcept! );

        dispatch(setAdminConcept(newConcept, true));
        dispatch(setConcept(newUiConcept));
    }

    private handleUndoChangesClick = () => {
        const { uneditedUiConcept } = this.props.data.concepts;
        const { dispatch } = this.props;

        dispatch(revertAdminConceptToOriginal());
        dispatch(setConcept(uneditedUiConcept!));
    }

    private handleSaveChangesClick = () => {
        const { currentConcept, uneditedUiConcept } = this.props.data.concepts;
        const { dispatch } = this.props;
        const newUiConcept = adminToNormalConcept(currentConcept!, uneditedUiConcept! );

        dispatch(saveAdminConcept(currentConcept!, newUiConcept));
    }

    private handleDeleteConceptClick = () => {
        const { currentConcept, uneditedUiConcept } = this.props.data.concepts;
        const { dispatch } = this.props;

        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the Concept, "${currentConcept!.uiDisplayName}"? This can't be undone.`,
            header: 'Delete Concept',
            onClickNo: () => null,
            onClickYes: () => { dispatch(deleteAdminConcept(currentConcept!, uneditedUiConcept!)) },
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Delete Concept`
        };
        dispatch(showConfirmationModal(confirm));
    }
}