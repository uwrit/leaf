/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Row, Button } from 'reactstrap';
import AdminState from '../../../models/state/AdminState';
import { WhatsThis } from '../../Other/WhatsThis/WhatsThis';
import VisualizationPageSidebar from './VisualizationPageSidebar/VisualizationPageSidebar';
import VisualizationSpecEditor from './VisualizationSpecEditor/VisualizationSpecEditor';
import { CohortState, CohortStateType } from '../../../models/state/CohortState';
import { VisualizationPage as VisualizationPageModel } from '../../../models/visualization/Visualization';
import { InformationModalState } from '../../../models/state/GeneralUiState';
import { showInfoModal } from '../../../actions/generalUi';
import { setAdminCurrentVisualizationPageWithDatasetCheck, undoAdminVisualizationPageChange } from '../../../actions/admin/visualization';
import VisualizationPage from './VisualizationPage/VisualizationPage';
import { Direction, DirectionalSlider } from '../../Other/DirectionalSlider/DirectionalSlider';
import { FiChevronRight } from 'react-icons/fi';
import './VisualizationEditor.css';

interface Props { 
    cohort: CohortState;
    data: AdminState;
    dispatch: any;
}

interface State {
    editing: boolean;
    selectedComponentIndex: number;
}

export class VisualizationEditor extends React.PureComponent<Props,State> {
    private className = 'visualization-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            editing: false,
            selectedComponentIndex: -1
        }
    }

    public render() {
        const c = this.className;
        const { cohort, data, dispatch } = this.props;
        const { selectedComponentIndex, editing } = this.state;
        const { visualizations } = data;
        const { currentPage, changed } = visualizations;
        const cohortReady = cohort.count.state === CohortStateType.LOADED;
        let datasetsLoaded = this.checkDatasetsLoaded();

        return (
            <Container fluid={true} className={`${c} admin-panel-editor`}>

                {/* Header */}
                <div className={`${c}-toprow`}>
                    <Button className='leaf-button leaf-button-addnew'>
                        + Create New Visualization
                    </Button>
                    <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChangesClick}>
                        Undo Changes
                    </Button>
                    <Button className='leaf-button leaf-button-primary' disabled={!changed}>
                        Save
                    </Button>
                    <Button className='leaf-button leaf-button-primary hide-editor' onClick={this.handleHideEditorClick} disabled={!editing}>
                        <span><FiChevronRight/></span>
                        <span>Hide Editor</span>
                    </Button>

                    {/* Explanation */}
                    <WhatsThis question={'What is a Leaf Visualization?'} body={`Visualizations`} />
                </div>

                <Row className={this.getClasses().join(' ')}>

                    {/* Sidebar */}
                    <div className={`${c}-sidebar-container`}>
                        <VisualizationPageSidebar pages={visualizations.pages} clickHandler={this.handleSidebarClick} />
                    </div>

                    {/* Preview */}
                    <div className={`${c}-preview-container`}>

                        {/* Viz Page */}
                        {data.visualizations.currentPage && datasetsLoaded &&
                        <VisualizationPage 
                            adminMode={true}
                            editing={editing}
                            componentClickHandler={this.handlePageComponentClick} 
                            datasets={data.visualizations.datasets}
                            dispatch={dispatch} 
                            padding={editing ? 250 : 0}
                            page={currentPage} 
                        />
                        }

                        {/* 'Select a Page' fallback */}
                        {!data.visualizations.currentPage &&
                        <div className={`${c}-no-page-selected`}>
                            <p>
                                <span>Select a Visualization Page from the left to begin editing or </span>
                                <span className='link-span'>create one</span>
                            </p>
                        </div>
                        }

                        {/* Dependent datasets not yet loaded and no cohort */}
                        {!datasetsLoaded && !cohortReady &&
                        <div className={`${c}-no-cohort`}>
                            <p>
                                Leaf can't show visualizations because you haven't loaded a cohort. To test or create visualizations,
                                load a cohort on the Find Patients screen, then return here. Leaf will then be able to generate data you
                                can create visualizations with
                            </p>
                        </div>
                        }
                    </div>

                    {/* Editor, slides in from right */}
                    <DirectionalSlider
                        show={editing}
                        from={Direction.Right}
                        overlay={false}
                        toggle={this.noOp}>

                        <VisualizationSpecEditor
                            page={currentPage} 
                            componentIndex={selectedComponentIndex} 
                            dispatch={dispatch} 
                        />
                    </DirectionalSlider>

                </Row>

            </Container>
        );
    }

    private getClasses = (): string[] => {
        const { editing, selectedComponentIndex } = this.state;
        const { currentPage } = this.props.data.visualizations;
        const classes = [ `${this.className}-main-container scrollable-offset-by-header` ];

        if (editing && selectedComponentIndex > -1) {
            const comp = currentPage.components[selectedComponentIndex];
            const prevComp = selectedComponentIndex > 0 ? currentPage.components[selectedComponentIndex-1] : undefined;
            const nextComp = selectedComponentIndex < currentPage.components.length-1 ? currentPage.components[selectedComponentIndex+1] : undefined;

            // If full-width, focus on right side
            if (comp.isFullWidth) {
                classes.push('emphasis-right');

            // Else if preceding or following is full width, focus on left
            } else if ((prevComp && prevComp.isFullWidth) || (nextComp && nextComp.isFullWidth)) {
                classes.push('emphasis-left');
            
            } else {
                classes.push('emphasis-right');
            }
        }

        return classes;
    }

    private checkDatasetsLoaded = (): boolean => {
        const { currentPage, datasets } = this.props.data.visualizations;

        if (currentPage) {
            for (const comp of currentPage.components) {
                for (const dsref of comp.datasetQueryRefs) {
                    const status = datasets.get(dsref.id);
                    if (!status || status.state !== CohortStateType.LOADED) {
                        return false;
                    }
                }
            }
        } else {
            return false;
        }
        return true;
    }

    private handleSidebarClick = (page: VisualizationPageModel) => {
        const { data, dispatch } = this.props;

        if (data.visualizations.changed) {
            const info: InformationModalState = {
                body: "Please Save or Undo your changes",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
            return;
        }

        const adminPage = data.visualizations.pages.get(page.id);
        this.setState({ selectedComponentIndex: -1, editing: false });
        dispatch(setAdminCurrentVisualizationPageWithDatasetCheck(adminPage));
    }

    private handlePageComponentClick = (selectedComponentIndex: number) => {
        this.setState({ selectedComponentIndex, editing: true });
    }

    private handleHideEditorClick = () => {
        this.setState({ editing: false });
    }

    private handleUndoChangesClick = () => {
        const { dispatch } = this.props;
        dispatch(undoAdminVisualizationPageChange());
    }

    private noOp = (): any => null;
}