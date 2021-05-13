/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { AdminVisualizationPage } from '../../../../models/admin/Visualization';
import { setAdminCurrentVisualizationPage } from '../../../../actions/admin/visualization';
import { Section } from '../../Section/Section';
import { Button, Col, Container, Row } from 'reactstrap';
import { FiChevronRight } from 'react-icons/fi';
import 'ace-builds'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import AceEditor from 'react-ace'; 
import { TextArea } from '../../Section/TextArea';
import { Checkbox } from '../../Section/Checkbox';
import './VisualizationSpecEditor.css';

interface Props { 
    hideEditorClickHandler: () => any;
    page?: AdminVisualizationPage;
    componentIndex: number;
    dispatch: any;
}

export default class VisualizationSpecEditor extends React.PureComponent<Props> {
    private className = 'visualization-spec-editor';

    public render() {
        const c = this.className;
        const { componentIndex, page, hideEditorClickHandler } = this.props;

        if (componentIndex === -1 || componentIndex > page.components.length-1) {
            return (
                <div className={c}>
                    <div className={`${c}-unselected`}>Select a Visualization Component to edit</div>
                </div>
            )
        }
        const comp = page.components[componentIndex];

        return (
            <div className={c}>

                <Button className='leaf-button leaf-button-secondary' onClick={hideEditorClickHandler}>
                    <span><FiChevronRight/></span>
                    <span>Hide Editor</span>
                </Button>

                <Section header='Page Display'>
                    <Row>
                        <Col md={12}>
                        <TextArea
                            changeHandler={this.handlePageNameChange} propName={'name'} value={page.pageName}
                            label='Page Name' required={true} subLabel='Name of this Visualization Page. This is the text that is displayed in the left sidebar' 
                            locked={false} forceValidation={false} errorText='Enter a Name'
                        />
                        </Col>
                    </Row>
                </Section>

                <Section header='Visualization Display'>
                    <Row>
                        <Col md={12}>
                            <TextArea
                                changeHandler={this.handleComponentChange} propName={'header'} value={comp.header}
                                label='Header' required={true} subLabel='Header Text for this Visualization' locked={false}
                                forceValidation={false} errorText='Enter Header text'
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <TextArea
                                changeHandler={this.handleComponentChange} propName={'subHeader'} value={comp.subHeader}
                                label='SubHeader' required={true} subLabel='Optional SubHeader Text for this Visualization' locked={false}
                                forceValidation={false}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Checkbox
                                changeHandler={this.handleComponentChange} propName={'isFullWidth'} value={comp.isFullWidth} 
                                label='Full Width' subLabel='Show the visualization at full page width. If false, will be half width'
                            />
                        </Col>
                    </Row>
                </Section>

                <Section header='JSON Editor'>

                    {/* Leaf-generated JSON */}
                    <div className={`${c}-leaf-json`}>
                        <span>Base JSON visualization specification</span>
                        <pre style={{ backgroundColor: 'rgb(240,240,240)' }}>
                            {this.getLeafGeneratedSpec()}
                        </pre>
                    </div>

                    {/* JSON Spec Editor */}
                    <span>JSON visualization specification</span>
                    <div>
                        <small className="form-text text-muted">
                            Enter a valid Vega JSON specification here. Your JSON will be merged with the Leaf auto-generated specification
                            above to create your visualization
                        </small>
                    </div>
                    <AceEditor
                        className={`${c}-json`}
                        style={{ backgroundColor: 'rgb(240,240,240)' }}
                        editorProps={{ $blockScrolling: Infinity }}
                        highlightActiveLine={true}
                        onChange={this.handleJsonSpecChange}
                        height={`${500}px`}
                        width={`${100}%`}
                        mode="json"
                        showPrintMargin={false}
                        value={comp.jsonSpec}
                        setOptions={{
                            fontSize: 12,
                            showGutter: false,
                            showLineNumbers: false,
                            tabSize: 2,
                        }}
                    />
                
                </Section>

            </div>
        );
    }

    private getLeafGeneratedSpec = (): string => {
        const { page, componentIndex } = this.props;

        if (componentIndex === -1) return null;
        const { datasetQueryRefs } = page.components[componentIndex];

        const leafGeneratedSpec = {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            data: datasetQueryRefs.length > 1
                ? datasetQueryRefs.map(dsref => ({ name: dsref.name }))
                : { name: datasetQueryRefs.length ? datasetQueryRefs[0].name : '' }
        };

        return JSON.stringify(leafGeneratedSpec, null, 2);
    }

    private handlePageNameChange = (value: string) => {
        const { page, dispatch } = this.props;
        const newPage = Object.assign({}, page, { pageName: value });
        dispatch(setAdminCurrentVisualizationPage(newPage));
    }

    private noOp = () => null as any;

    private handleComponentChange = (value: string, propName: string) => {
        const { page, componentIndex, dispatch } = this.props;
        const newComp = Object.assign({}, page.components[componentIndex], { [propName]: value });
        const newPage = Object.assign({}, page);
        newPage.components[componentIndex] = newComp;
        dispatch(setAdminCurrentVisualizationPage(newPage));
    }

    private handleJsonSpecChange = (value: string, evt: any) => {
        const { page, componentIndex, dispatch } = this.props;
        const newComp = Object.assign({}, page.components[componentIndex], { jsonSpec: value });
        const newPage = Object.assign({}, page);
        newPage.components[componentIndex] = newComp;
        dispatch(setAdminCurrentVisualizationPage(newPage));
    }
}