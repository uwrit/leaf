/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { AdminVisualizationComponent, AdminVisualizationPage } from '../../../../models/admin/Visualization';
import AceEditor from 'react-ace'; 
import 'ace-builds/src-noconflict/mode-json';
import './VisualizationSpecEditor.css';
import { setAdminCurrentVisualizationPage } from '../../../../actions/admin/visualization';
import { Col, Row } from 'reactstrap';

interface Props { 
    currentPage?: AdminVisualizationPage;
    currentComponent?: AdminVisualizationComponent;
    dispatch: any;
}

export default class VisualizationSpecEditor extends React.PureComponent<Props> {
    private className = 'visualization-spec-editor';

    public render() {
        const c = this.className;
        const { currentComponent } = this.props;

        if (!currentComponent) {
            return (
                <div className={c}>
                    <div className={`${c}-unselected`}>Select a Visualization Component to edit</div>
                </div>
            )
        }

        return (
            <div className={`${c}-container`}>

                <Row>
                    <Col md={6}>

                    </Col>

                    <Col md={6}>

                        {/* JSON Spec Editor */}
                        <AceEditor
                        className={c}
                        style={{ backgroundColor: 'white' }}
                        editorProps={{ $blockScrolling: Infinity }}
                        highlightActiveLine={true}
                        onChange={this.handleInputChange}
                        height={`${500}px`}
                        width={`${800}px`}
                        mode="json"
                        showPrintMargin={false}
                        value={currentComponent.jsonSpec}
                        setOptions={{
                            fontSize: 12,
                            showGutter: false,
                            showLineNumbers: false,
                            tabSize: 2,
                        }}
                    />
                    </Col>
                </Row>

            </div>
        );
    }

    private handleInputChange = (value: string, evt: any) => {
        const { currentPage, currentComponent, dispatch } = this.props;
        const page = Object.assign({}, currentPage);
        const comp = Object.assign({}, currentComponent, {
            jsonSpec: value
        });
        const idx = page.components.findIndex(c => c.id === comp.id);
        if (idx > -1) {
            page.components[idx] = comp;
            dispatch(setAdminCurrentVisualizationPage(page));
        }
    }
}