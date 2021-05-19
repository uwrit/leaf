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
import { saveAdminVisualizationPage, setAdminCurrentVisualizationPageWithDatasetCheck, undoAdminVisualizationPageChange } from '../../../actions/admin/visualization';
import VisualizationPage from '../../Visualize/Custom/VisualizationPage';
import { Direction, DirectionalSlider } from '../../Other/DirectionalSlider/DirectionalSlider';
import { FiChevronRight } from 'react-icons/fi';
import { View, ViewListener } from '../../../bundled/react-vega';
import './VisualizationEditor.css';

interface Props { 
    cohort: CohortState;
    data: AdminState;
    dispatch: any;
}

interface State {
    editing: boolean;
    previewWidth: number;
    vizInputSample?: any[];
    selectedComponentIndex: number;
    sidebarWidth: number;
}

interface HydratedView extends View {
    _runtime: HydratedViewRuntime;
}

interface HydratedViewRuntime {
    data: HydratedViewRuntimeData;
}

interface HydratedViewRuntimeData {
    data_0?: HydratedViewRuntimeSource;
    data_1?: HydratedViewRuntimeSource;
    marks: any;
    root: any;
    source_0?: HydratedViewRuntimeSource;
    source_1?: HydratedViewRuntimeSource;
}

interface HydratedViewRuntimeSource {
    input: HydratedViewRuntimeSourceValueArray;
    output: HydratedViewRuntimeSourceValueArray;
    values: HydratedViewRuntimeSourceValueArray;
}

interface HydratedViewRuntimeSourceValueArray {
    value: any[];
}

export class VisualizationEditor extends React.PureComponent<Props,State> {
    private className = 'visualization-editor';

    constructor(props: Props) {
        super(props);
        const dimensions = this.computePageDimensions();
        this.state = {
            editing: false,
            previewWidth: dimensions ? dimensions.previewWidth : 1000,
            selectedComponentIndex: -1,
            sidebarWidth: dimensions ? dimensions.sidebarWidth : 200
        }
    }

    private computePageDimensions = () => {
        const sidebar = document.getElementsByClassName('visualization-page-sidebar');
        const main = document.getElementsByClassName('visualization-editor-main-container');

        if (!sidebar.length || !main.length) return;

        const sidebarWidth = sidebar[0].getClientRects()[0].width;
        const mainWidth = main[0].getClientRects()[0].width;
        const previewWidth = mainWidth + sidebarWidth;

        return { sidebarWidth, previewWidth };
    }

    private updateDimensions = () => {
        const dimensions = this.computePageDimensions();
        if (!dimensions) return;

        const { previewWidth, sidebarWidth } = dimensions;
        this.setState({ previewWidth, sidebarWidth });
    }

    public componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    public render() {
        const c = this.className;
        const { cohort, data, dispatch } = this.props;
        const { selectedComponentIndex, editing, previewWidth, vizInputSample } = this.state;
        const { visualizations } = data;
        const { currentPage, changed, datasets } = visualizations;
        const cohortReady = cohort.count.state === CohortStateType.LOADED;
        let noCanDo = null;

        /**
         * Check if visualizations can be generated
         */
        if (!cohortReady) {
            noCanDo = (
                <p>
                    <span>
                        Leaf can't show visualizations because you haven't loaded a cohort. To test or create visualizations,
                        load a cohort on the Find Patients screen, then return here. Leaf will then be able to generate data you
                        can create visualizations with
                    </span>
                </p>
            );
        } else if (cohortReady && !data.visualizations.currentPage) {
            noCanDo = (
                <p>
                    <span>Select a Visualization Page from the left to begin editing or </span>
                    <span className='link-span'>create one</span>
                </p>
            );
        } 

        return (
            <Container fluid={true} className={`${c} admin-panel-editor`}>

                {/* Header */}
                <div className={`${c}-toprow`}>
                    <Button className='leaf-button leaf-button-addnew' disabled={changed}>
                        + Create New Visualization
                    </Button>
                    <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChangesClick}>
                        Undo Changes
                    </Button>
                    <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveClick}>
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
                        {!noCanDo &&
                        <VisualizationPage
                            adminMode={true}
                            editing={editing}
                            componentClickHandler={this.handlePageComponentClick} 
                            datasets={data.visualizations.datasets}
                            page={currentPage} 
                            selectedComponentIndex={selectedComponentIndex}
                            width={previewWidth}
                            viewUpdateHandler={this.handleViewUpdate}
                        />
                        }

                        {/* Else show fall back message */}
                        {noCanDo &&
                        <div className={`${c}-nocando`}>{noCanDo}</div>}

                    </div>

                    {/* Editor, slides in from right */}
                    <DirectionalSlider
                        show={editing}
                        from={Direction.Right}
                        overlay={false}
                        toggle={this.noOp}>

                        <VisualizationSpecEditor
                            datasets={datasets}
                            page={currentPage} 
                            componentIndex={selectedComponentIndex} 
                            dispatch={dispatch}
                            vizInputSample={vizInputSample}
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

    private handleViewUpdate: ViewListener = (view: View) => {
        return;
        const v = view as HydratedView;

        try {
            if (v._runtime && v._runtime.data && (v._runtime.data.data_0 || v._runtime.data.source_0)) {
                const d = v._runtime.data.data_0 ? v._runtime.data.data_0 : v._runtime.data.source_0;
                const top10keys = Object.keys(d.input.value).slice(0, 10);
                const sample: any[] = top10keys.map(k => d.input.value[k as any])
                this.setState({ vizInputSample: sample });
                console.log(sample[0]);
            }
        } catch (err) {}
    }

    private handleSidebarClick = (page: VisualizationPageModel) => {
        const { data, dispatch, cohort } = this.props;
        const cohortReady = cohort.count.state === CohortStateType.LOADED;

        if (data.visualizations.changed) {
            const info: InformationModalState = {
                body: "Please Save or Undo your changes",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
            return;
        } else if (!cohortReady) {
            const info: InformationModalState = {
                body: "Please create a cohort on the Find Patients screen to use for Visualization, first.",
                header: "No Cohort Selected",
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

    private handleSaveClick = () => {
        const { dispatch, data } = this.props;
        dispatch(saveAdminVisualizationPage(data.visualizations.currentPage));
    }

    private noOp = (): any => null;
}