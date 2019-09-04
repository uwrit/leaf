/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import ConceptColumnContainer from '../../../containers/FindPatients/ConceptColumnContainer';
import AdminState from '../../../models/state/AdminState';
import PanelFilterRow from './PanelFilterRow/PanelFilterRow';
import { PanelFilter } from '../../../models/admin/PanelFilter';
import { setAdminPanelFilter, undoAdminPanelFilterChanges, processApiUpdateQueue } from '../../../actions/admin/panelFilter';
import { PanelFilterPreview } from './PanelFilterPreview/PanelFilterPreview';
import './PanelFilterEditor.css';
import { ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../actions/generalUi';

interface Props { 
    data: AdminState;
    dispatch: any;
}

interface State {
    selectedFilterId?: number;
    forceValidation: boolean;
    showPreview: boolean;
}

export class PanelFilterEditor extends React.PureComponent<Props,State> {
    private className = 'panelfilter-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            forceValidation: false,
            showPreview: false
        }
    }

    public render() {
        const { data, dispatch } = this.props;
        const { selectedFilterId, forceValidation, showPreview } = this.state;
        const { panelFilters } = data;
        const { changed } = panelFilters;
        const c = this.className;
        let selectedFilter;

        if (selectedFilterId) {
            selectedFilter = panelFilters.data.get(selectedFilterId);
        }
        

        return (
            <div className={c}>
                <Container fluid={true}>
                    <Row className={`${c}-container-row`}>

                        {/* Concepts (can be dragged over) */}
                        <Col md={4} lg={4} xl={5} className={`${c}-column-left`}>
                            <div className={`${c}-column-left-overlay ${showPreview ? 'show' : ''}`}></div>
                            <ConceptColumnContainer />
                        </Col>

                        {/* Panel Filter Editor */}
                        <Col md={7} className={`${c}-column-right admin-panel-editor scrollable-offset-by-header`}>

                            {/* Header */}
                            <div className={`${c}-header`}>
                                <Button className='leaf-button leaf-button-addnew' onClick={this.handleAddNewClick}>
                                    + Create New Concept
                                </Button>
                                <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChanges}>
                                    Undo Changes
                                </Button>
                                <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveChangesClick}>
                                    Save
                                </Button>
                            </div>

                            {/* Panel Filters */}
                            <div className={`${c}-panelfilter-container`}>
                                {[ ...panelFilters.data.values() ]
                                    .map(pf => {
                                        return (
                                            <PanelFilterRow 
                                                key={pf.id} 
                                                dispatch={dispatch} 
                                                panelFilter={pf} 
                                                forceValidation={forceValidation}
                                                togglePreview={this.togglePanelFilterPreview}
                                            />);
                                    })
                                }
                            </div>
                        </Col>
                    </Row>
                </Container>
                {showPreview && selectedFilter &&
                    <PanelFilterPreview panelFilter={selectedFilter} />
                }
            </div>
        );
    }

    /* 
     * Generate the an integer 1 higher than the max
     * of the current.
     */
    private generateSequentialIntegerId = () => {
        const { data } = this.props.data.panelFilters;
        if (!data.size) { return 1; }
        const max = Math.max.apply(Math, [ ...data.values() ].map((s) => s.id));
        return max + 1;
    }

    private handleAddNewClick = () => {
        const { dispatch } = this.props;
        const newPf: PanelFilter = {
            id: this.generateSequentialIntegerId(),
            isInclusion: true,
            uiDisplayText: "New Filter",
            uiDisplayDescription: "Enter a description of the panel filter."
        }
        dispatch(setAdminPanelFilter(newPf, true));
    }

    private handleUndoChanges = () => {
        const { dispatch } = this.props;
        this.setState({ forceValidation: false });
        dispatch(undoAdminPanelFilterChanges());
    }

    /*
     * Handle a save event.
     */
    private handleSaveChangesClick = () => {
        const { dispatch } = this.props;
        const valid = this.currentPanelFiltersAreValid();
        if (valid) {
            dispatch(processApiUpdateQueue());
        } else {
            const confirm: ConfirmationModalState = {
                body: `One or more fields in the Panel Filters are missing necessary data. Are you sure you want to save?`,
                header: 'Missing Panel Filter data',
                onClickNo: () => null,
                onClickYes: () => { 
                    dispatch(processApiUpdateQueue());
                    this.setState({ forceValidation: false });
                },
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Save Panel Filters`
            };
            dispatch(showConfirmationModal(confirm));
            this.setState({ forceValidation: true });
        }
    }


    /*
     * Validate that current admin Panel Filter is valid. Called on 'Save' click.
     */
    private currentPanelFiltersAreValid = (): boolean => {
        const { data } = this.props.data.panelFilters;

        for (const pf of [ ...data.values() ]) {
            if (pf.changed || pf.unsaved) {
                if (!pf.concept || !pf.conceptId) { return false; }
                if (!pf.uiDisplayText || !pf.uiDisplayDescription) { return false; }
            }
        }
        return true;
    }

    private togglePanelFilterPreview = (show: boolean, selectedFilterId: number): void => {
        const { showPreview } = this.state;
        if (show !== showPreview) {
            this.setState({ showPreview: show, selectedFilterId });
        }
    }
}