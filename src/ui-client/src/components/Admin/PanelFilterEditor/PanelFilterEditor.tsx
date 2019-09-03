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
import './PanelFilterEditor.css';
import { PanelFilter } from '../../../models/admin/PanelFilter';
import { setAdminPanelFilter, undoAdminPanelFilterChanges } from '../../../actions/admin/panelFilter';

interface Props { 
    data: AdminState;
    dispatch: any;
}

interface State {
    forceValidation: boolean;
}

export class PanelFilterEditor extends React.PureComponent<Props,State> {
    private className = 'panelfilter-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            forceValidation: false
        }
    }

    public render() {
        const { data, dispatch } = this.props;
        const { forceValidation } = this.state;
        const { panelFilters } = data;
        const { changed } = panelFilters;
        const c = this.className;

        return (
            <div className={c}>
                <Container fluid={true}>
                    <Row className={`${c}-container-row`}>

                        {/* Concepts (can be dragged over) */}
                        <Col md={4} lg={4} xl={5} className={`${c}-column-left`}>
                            <ConceptColumnContainer />
                        </Col>

                        {/* Panel Filter Editor */}
                        <Col md={7} className={`${c}-column-right admin-panel-editor scrollable-offset-by-header`}>

                            {/* Header */}
                            <div className={`${c}-header`}>
                                <Button className='leaf-button leaf-button-addnew' disabled={changed} onClick={this.handleAddNewClick}>
                                    + Create New Concept
                                </Button>
                                <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChanges}>
                                    Undo Changes
                                </Button>
                                <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveChanges}>
                                    Save
                                </Button>
                            </div>

                            {/* Panel Filters */}
                            <div className={`${c}-panelfilter-container`}>
                                {[ ...panelFilters.data.values() ]
                                    .map(pf => {
                                        return <PanelFilterRow key={pf.id} dispatch={dispatch} panelFilter={pf} forceValidation={forceValidation} />
                                    })
                                }
                            </div>
                        </Col>
                    </Row>
                </Container>
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

    private handleSaveChanges = () => {

    }
}