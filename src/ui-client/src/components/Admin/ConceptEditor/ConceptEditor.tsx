/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import ConceptColumnContainer from '../../../containers/FindPatients/ConceptColumnContainer';
import AdminState, { AdminPanelConceptEditorPane } from '../../../models/state/AdminState';
import { MainEditor } from './MainEditor/MainEditor';
import { SqlPreview } from './Previews/SqlPreview/SqlPreview';
import { PanelPreview } from './Previews/PanelPreview/PanelPreview';
import { SqlSetEditor } from './SqlSetEditor/SqlSetEditor';
import './ConceptEditor.css';

interface Props { 
    data: AdminState;
    dispatch: any;
}

interface State {
    showOverlay: boolean;
    showPanelPreview: boolean;
    showSqlPreview: boolean;
}

export class ConceptEditor extends React.PureComponent<Props,State> {
    private className = 'concept-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            showOverlay: false,
            showPanelPreview: false,
            showSqlPreview: false
        }
    }

    public render() {
        const { showPanelPreview, showSqlPreview } = this.state;
        const { data } = this.props;
        const c = this.className;

        return (
            <div className={c}>
                <Container fluid={true}>
                    <Row className={`${c}-container-row`}>
                        <Col md={4} lg={4} xl={5} className={`${c}-column-left`}>
                            <div className={`${c}-column-left-overlay ${showSqlPreview || showPanelPreview ? 'show' : ''}`}></div>
                            <ConceptColumnContainer />
                        </Col>
                        <div className={`${c}-column-right`}>
                            {this.getCurrentPane()}
                        </div>
                    </Row>
                </Container>
                {showSqlPreview &&
                    <SqlPreview sql={data.concepts.exampleSql}/>
                }
                {showPanelPreview &&
                    <PanelPreview panel={data.concepts.examplePanel} />
                }
            </div>
        );
    }

    private getCurrentPane = (): any => {
        const { data, dispatch } = this.props;
        switch (data.concepts.pane) {
            case AdminPanelConceptEditorPane.MAIN:
                return  (
                    <MainEditor 
                        data={data} dispatch={dispatch} 
                        togglePanelPreview={this.togglePanelPreview} 
                        toggleSqlPreview={this.toggleSqlPreview} 
                        toggleOverlay={this.toggleOverlay}
                    />
                );
            case AdminPanelConceptEditorPane.SQL_SET:
                return (
                    <SqlSetEditor
                        data={data} dispatch={dispatch} 
                        togglePanelPreview={this.togglePanelPreview} 
                        toggleSqlPreview={this.toggleSqlPreview} 
                        toggleOverlay={this.toggleOverlay}
                    />
                );
        }
        return null;
    }

    private toggleSqlPreview = (show: boolean): void => {
        const { showSqlPreview } = this.state;
        if (show !== showSqlPreview) {
            this.setState({ showSqlPreview: show, showOverlay: show });
        }
    }

    private togglePanelPreview = (show: boolean): void => {
        const { showPanelPreview } = this.state;
        if (show !== showPanelPreview) {
            this.setState({ showPanelPreview: show, showOverlay: show });
        }
    }

    private toggleOverlay = (show: boolean): void => {
        const { showOverlay } = this.state;
        if (show !== showOverlay) {
            this.setState({ showOverlay: show });
        }
    }
}