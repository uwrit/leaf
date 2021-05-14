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
import { Col, Row } from 'reactstrap';
import { debounce } from 'lodash';
import 'ace-builds'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-iplastic';
import AceEditor from 'react-ace'; 
import { TextArea } from '../../Section/TextArea';
import { Checkbox } from '../../Section/Checkbox';
import { AdminVisualizationDatasetState } from '../../../../models/state/AdminState';
import VisualizationDatasetQueryRefRow from './VisualizationDatasetQueryRefRow';
import './VisualizationSpecEditor.css';

interface Props { 
    page?: AdminVisualizationPage;
    componentIndex: number;
    datasets: Map<string, AdminVisualizationDatasetState>;
    dispatch: any;
}

export default class VisualizationSpecEditor extends React.PureComponent<Props> {
    private className = 'visualization-spec-editor';

    public render() {
        const c = this.className;
        const { componentIndex, page, datasets } = this.props;

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

                <Section header="Datasets">
                    <div>
                        <p>
                            <span>Leaf Datasets supply the underlying data used to populate visualizations</span>
                        </p>
                    </div>
                    <div>
                        {comp.datasetQueryRefs.map(dsref => (
                            <VisualizationDatasetQueryRefRow dataset={datasets.get(dsref.id)} metadata={dsref} />
                        ))}
                        <div className={`${c}-datasets-addnew`}>+ Add New Dataset</div>
                    </div>
                </Section>

                <Section header='Vega-Lite JSON Editor'>
                    <div>
                        <p>
                            <span>Leaf Visualizations are defined using the </span>
                            <a href="https://vega.github.io/vega-lite/" target="_blank" rel="noreferrer">Vega-Lite JSON specification</a>
                            <span>. See the Vega-Lite </span>
                            <a href="https://vega.github.io/vega-lite/docs" target="_blank" rel="noreferrer">documentation</a>
                            <span> and </span>
                            <a href="https://vega.github.io/vega-lite/examples" target="_blank" rel="noreferrer">examples gallery</a>
                            <span> to learn more.</span>
                        </p>
                    </div>

                    {/* Leaf-generated JSON */}
                    <div className={`${c}-leaf-json`}>
                        <span>Base JSON visualization specification</span>
                        <AceEditor
                        className={`${c}-leaf-json`}
                        editorProps={{ $blockScrolling: Infinity }}
                        height="82px"
                        width="100%"
                        mode="json"
                        theme="iplastic"
                        readOnly={true}
                        highlightActiveLine={false}
                        value={this.getLeafGeneratedSpec()}
                        setOptions={{
                            fontSize: 12,
                            showGutter: false,
                            showLineNumbers: false,
                            tabSize: 2
                        }}
                    />
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
                        editorProps={{ $blockScrolling: Infinity }}
                        highlightActiveLine={true}
                        onChange={this.handleJsonSpecChange}
                        height={`${500}px`}
                        width={`${100}%`}
                        mode="json"
                        theme="iplastic"
                        showPrintMargin={false}
                        value={comp.jsonSpec}
                        setOptions={{
                            fontSize: 12,
                            showGutter: false,
                            showLineNumbers: false,
                            tabSize: 2
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

        const leafGeneratedSpec = 
`{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "datasets": { ${datasetQueryRefs.map(dsref => '"' + dsref.name + '": [...]' ).join(', ')} },
  "data": { "name": "${datasetQueryRefs[0].name}" }
}`;
        return leafGeneratedSpec;
    }

    private noOp = () => null as any;

    private handleComponentChange = (value: string, propName: string) => {
        const { page, componentIndex, dispatch } = this.props;
        const newComp = Object.assign({}, page.components[componentIndex], { [propName]: value });
        const newPage = Object.assign({}, page);
        newPage.components[componentIndex] = newComp;
        newPage.components = newPage.components.slice();
        dispatch(setAdminCurrentVisualizationPage(newPage, true));
    }

    private handleJsonSpecChange = debounce((value: string) => {
        const { page, componentIndex, dispatch } = this.props;
        const newComp = Object.assign({}, page.components[componentIndex], { jsonSpec: value });
        const newPage = Object.assign({}, page);
        newPage.components[componentIndex] = newComp;
        newPage.components = newPage.components.slice();
        dispatch(setAdminCurrentVisualizationPage(newPage, true));
    }, 750)
}