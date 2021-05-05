/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import AdminState from '../../../models/state/AdminState';
import { VegaLite } from 'react-vega'
import { WhatsThis } from '../../Other/WhatsThis/WhatsThis';
import VisualizationPageSidebar from './VisualizationPageSidebar/VisualizationPageSidebar';
import { AdminVisualizationComponent } from '../../../models/admin/Visualization';
import VisualizationSpecEditor from './VisualizationSpecEditor/VisualizationSpecEditor';
import { CohortState } from '../../../models/state/CohortState';
import { VisualizationPage } from '../../../models/visualization/Visualization';
import { InformationModalState } from '../../../models/state/GeneralUiState';
import { showInfoModal } from '../../../actions/generalUi';
import { setAdminCurrentVisualizationPage } from '../../../actions/admin/visualization';
import './VisualizationEditor.css';
import VisualizationPreview from './VisualizationPage/VisualizationPage';

interface Props { 
    cohort: CohortState;
    data: AdminState;
    dispatch: any;
}

interface State {
    selectedComponent?: AdminVisualizationComponent;
}

export class VisualizationEditor extends React.PureComponent<Props,State> {
    private className = 'visualization-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
        }
    }

    public render() {
        const c = this.className;
        const { cohort, data, dispatch } = this.props;
        const { selectedComponent } = this.state;
        const { visualizations } = data;
        const { currentPage, changed } = visualizations;
        let spec: any = null;

        if (currentPage && selectedComponent) {
            spec = {
                data: [
                    selectedComponent.datasetQueryIds.map(dsid => ({ name: dsid }))
                ]
            }
        }

        return (
            <Container fluid={true} className={`${c} admin-panel-editor`}>

                {/* Header */}
                <div className={`${c}-toprow`}>
                    <Button className='leaf-button leaf-button-addnew'>
                        + Create New Visualization
                    </Button>
                    <Button className='leaf-button leaf-button-secondary' disabled={!changed}>
                        Undo Changes
                    </Button>
                    <Button className='leaf-button leaf-button-primary' disabled={!changed}>
                        Save
                    </Button>

                    {/* Explanation */}
                    <WhatsThis
                        question={'What is a Leaf Visualization?'}
                        body={`Visualizations`}
                    />
                </div>

                <Row>

                    {/* Sidebar */}
                    <Col md={2}>
                        <VisualizationPageSidebar pages={visualizations.pages} clickHandler={this.sidebarClickHandler} />
                    </Col>

                    {/* Preview */}
                    <Col md={10}>
                        <VisualizationPreview data={data.visualizations} dispatch={dispatch} spec={spec}/>
                    </Col>

                    {/* Editor */}
                    <Col md={10}>

                        <VisualizationSpecEditor 
                            currentPage={currentPage} 
                            currentComponent={selectedComponent} 
                            dispatch={dispatch} 
                        />
                        
                    </Col>

                </Row>

            </Container>);
    }

    private sidebarClickHandler = (page: VisualizationPage) => {
        const { data, dispatch } = this.props;

        if (data.visualizations.changed) {
            const info: InformationModalState = {
                body: "Please Save or Undo your changes",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        }

        const adminPage = data.visualizations.pages.get(page.id);
        dispatch(setAdminCurrentVisualizationPage(adminPage));
    }
    
    public demorender() {
        const c = this.className;

        const spec = {
            width: 800,
            height: 400,
            "data": {
                "name": "values"
            },
            "params": [
                {
                    "name": "highlight",
                    "select": { "type": "point", "on": "mouseover" }
                },
                { "name": "select", "select": "point" },
                {
                    "name": "cornerRadius", "value": 0,
                    "bind": { "input": "range", "min": 0, "max": 50, "step": 1 }
                }
            ],
            "mark": {
                "type": "bar",
                "fill": "#4C78A8",
                "stroke": "black",
                "cursor": "pointer",
                "cornerRadius": { "expr": "cornerRadius" }
            },
            "encoding": {
                "x": { "field": "a", "type": "ordinal" },
                "y": { "field": "b", "type": "quantitative" },
                "fillOpacity": {
                    "condition": { "param": "select", "value": 1 },
                    "value": 0.3
                },
                "strokeWidth": {
                    "condition": [
                        {
                            "param": "select",
                            "empty": false,
                            "value": 2
                        },
                        {
                            "param": "highlight",
                            "empty": false,
                            "value": 1
                        }
                    ],
                    "value": 0
                }
            },
            "config": {
                "scale": {
                    "bandPaddingInner": 0.2
                }
            }
        } as any;
    
        const data = { "values": [
            {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
            {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
            {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
            ]
        }

        return (
            <div className={c}>
                <VegaLite spec={spec} data={data}/>
            </div>
        );
    }
}