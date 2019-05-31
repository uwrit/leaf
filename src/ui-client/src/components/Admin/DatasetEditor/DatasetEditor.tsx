/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import AdminState, { AdminPanelLoadState } from '../../../models/state/AdminState';
import { InformationModalState } from '../../../models/state/GeneralUiState';
import DatasetContainer from '../../PatientList/AddDatasetSelectors/DatasetContainer';
import { SqlBox } from '../../Other/SqlBox/SqlBox';
import { Section } from '../ConceptEditor/Sections/Section';
import { DefTemplates } from '../../../models/patientList/DatasetDefinitionTemplate';
import { PatientListDatasetShape, PatientListDatasetQuery, CategorizedDatasetRef } from '../../../models/patientList/Dataset';
import { AdminPanelPatientListColumnTemplate } from '../../../models/patientList/Column';
import { fetchAdminDatasetIfNeeded, setAdminDataset, setAdminDatasetShape, setAdminDatasetSql, revertAdminDatasetChanges, saveAdminDataset, saveAdminDemographicsDataset } from '../../../actions/admin/dataset';
import { AdminDatasetQuery } from '../../../models/admin/Dataset';
import { FiCheck } from 'react-icons/fi';
import { ShapeDropdown } from './ShapeDropdown/ShapeDropdown';
import formatSql from '../../../utils/formatSql';
import { TextArea } from '../ConceptEditor/Sections/TextArea';
import { Constraints } from './Constraints/Constraints';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon';
import { CategoryDropdown } from './CategoryDropdown/CategoryDropdown';
import { Tagger } from './Tagger/Tagger';
import { showInfoModal } from '../../../actions/generalUi';
import { DatasetsState } from '../../../models/state/AppState';
import { setDataset, allowDemographicsDatasetInSearch } from '../../../actions/datasets';
import './DatasetEditor.css';

interface Props { 
    data: AdminState;
    datasets: DatasetsState;
    dispatch: any;
}

interface State {
    categoryIdx: number;
    datasetIdx: number;
    shapes: PatientListDatasetShape[];
}

export class DatasetEditor extends React.PureComponent<Props,State> {
    private className = 'dataset-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            categoryIdx: 0,
            datasetIdx: -1,
            shapes: []
        }
    }

    public componentDidMount() {
        const { dispatch } = this.props;
        let shapes: PatientListDatasetShape[] = [];

        DefTemplates.forEach((t) => { 
            if (t.shape !== PatientListDatasetShape.Demographics) { 
                shapes.push(t.shape);
            }
        });
        shapes = shapes.sort((a,b) => PatientListDatasetShape[a] > PatientListDatasetShape[b] ? 1 : -1);

        this.setState({ shapes });
        dispatch(allowDemographicsDatasetInSearch(true));
    }

    public componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch(allowDemographicsDatasetInSearch(false));
        dispatch(setAdminDataset(undefined, false));
    }

    public render() {
        const { data, datasets, dispatch } = this.props;
        const { categoryIdx, datasetIdx, } = this.state;
        const { currentDataset, changed } = data.datasets;
        const c = this.className;

        return (
            <div className={c}>
                <Container fluid={true}>
                    <Row className={`${c}-container-row`}>
                        <Col md={4} lg={4} xl={5} className={`${c}-column-left`}>
                            <DatasetContainer 
                                autoSelectOnSearch={false}
                                categoryIdx={categoryIdx}
                                datasetIdx={datasetIdx}
                                datasets={datasets}
                                dispatch={dispatch}
                                handleDatasetSelect={this.handleDatasetSelect}
                                handleDatasetRequest={this.handleDatasetRequest}
                                searchEnabled={!changed}
                            />
                        </Col>
                        <div className={`${c}-column-right`}>
                            {this.getStatusDependentContent(data.datasets.state, 'concept-editor')}
                            <div className={`${c}-main`}>

                                {/* New, Undo, Save, Delete buttons */}
                                {datasets.allMap.size > 0 &&
                                <div className={`${c}-column-right-header`}>
                                    <Button className='leaf-button leaf-button-addnew' disabled={changed}>+ Create New Dataset</Button>
                                    <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChanges}>Undo Changes</Button>
                                    <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveChanges}>Save</Button>
                                    <Button className='leaf-button leaf-button-warning' disabled={!currentDataset || currentDataset.shape === PatientListDatasetShape.Demographics}>Delete</Button>
                                </div>
                                }        

                                {/* Editor */}
                                {currentDataset &&
                                    this.getDatasetEditorContent(currentDataset)
                                }

                            </div>
                        </div>
                    </Row>
                </Container>
            </div>
        );
    }

    private getDatasetEditorContent = (dataset: AdminDatasetQuery) => {
        const { dispatch, data } = this.props;
        const { shapes } = this.state;
        const { currentDataset, expectedColumns } = data.datasets;
        const sqlWidth = this.getSqlWidth();
        const locked = currentDataset && currentDataset.shape === PatientListDatasetShape.Demographics;
        const c = this.className;
        let currentCategory = undefined;

        if (dataset && dataset.categoryId) {
            currentCategory = data.datasetQueryCategories.categories.get(dataset.categoryId)!;
        }

        return (
           <div>
               <Section header='Display'>
                    <Row>
                        <Col md={4}>
                        <TextArea 
                            changeHandler={this.handleInputChange} propName={'name'} value={dataset.name}
                            label='Name' required={true} subLabel='Text for this Dataset' locked={locked}
                        />
                        </Col>
                        <Col md={4}>
                            <CategoryDropdown
                                changeHandler={this.handleInputChange} 
                                dispatch={dispatch} 
                                currentCategory={currentCategory} 
                                categories={data.datasetQueryCategories.categories}
                                locked={locked}
                            />
                        </Col>
                        <Col md={4}>
                            <ShapeDropdown dispatch={dispatch} shapes={shapes} selected={dataset.shape} clickHandler={this.handleShapeClick} locked={locked}/>
                        </Col>
                    </Row>
                </Section>
                <Section header='SQL'>
                <div className={`${c}-sql-container`}>
                    <div className={`${c}-column-container`}>
                        {expectedColumns.map((col) => this.getColumnContent(col))}
                    </div>
                    <div className={`${c}-sql`}>
                        <SqlBox sql={dataset.sql} height={350} width={sqlWidth} readonly={false} changeHandler={this.handleSqlChange}/>
                        <div className={`${c}-sql-autoformat`} onClick={this.handleAutoFormatClick}>Auto-format</div>
                    </div>
                </div>
                </Section>
                <Row>
                    <Col md={6}>
                        <Section header='Identifiers'>
                            <TextArea 
                                changeHandler={this.handleInputChange} propName={'universalId'} value={dataset.universalId}
                                label='Universal Id' subLabel='Used if Leaf is querying multiple instances. This Id must match at all institutions in order for queries to be mapped correctly.' locked={locked}
                            />
                            <Tagger
                                changeHandler={this.handleInputChange} propName={'tags'} tags={dataset.tags} locked={locked}
                            />
                        </Section>
                    </Col>
                    <Col md={6}>
                        <Section header='Access Restrictions'>
                            <Constraints dataset={dataset} changeHandler={this.handleInputChange} locked={locked}/>
                        </Section>
                    </Col>
                </Row>
            </div>
        );
    }

    /* 
     * Sets optional content.
     */
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

    /*
     * Triggers a fallback to unedited, undoing any current changes.
     */
    private handleUndoChanges = () => {
        const { datasets} = this.props.data;
        const { dispatch } = this.props;

        if (datasets.currentDataset!.unsaved) {
            dispatch(setAdminDataset(undefined, false));
        } else {
            dispatch(revertAdminDatasetChanges(datasets.currentDataset!));
        }
    }

    /*
     * Handles initiation of saving async changes and syncing with the DB.
     */
    private handleSaveChanges = () => {
        const { datasets} = this.props.data;
        const { dispatch } = this.props;

        if (datasets.currentDataset!.shape === PatientListDatasetShape.Demographics) {
            dispatch(saveAdminDemographicsDataset(datasets.currentDataset!))
        } else {
            dispatch(saveAdminDataset(datasets.currentDataset!));
        }
    }

    /* 
     * Handles tracking of input changes to the Dataset.
     */
    private handleInputChange = (val: any, propName: string) => {
        const { datasetQueryCategories } = this.props.data;
        const { currentDataset } = this.props.data.datasets;
        const { categoryIdx, datasetIdx } = this.state;
        const { dispatch } = this.props;

        if (currentDataset!.shape !== PatientListDatasetShape.Demographics) {
            const newAdminDs = Object.assign({}, currentDataset, { [propName]: val }) as AdminDatasetQuery;
            const newDs: PatientListDatasetQuery = {
                ...newAdminDs,
                category: newAdminDs.categoryId ? datasetQueryCategories.categories.get(newAdminDs.categoryId)!.category : ''
            };

            dispatch(setAdminDataset(newAdminDs, true));
            dispatch(setDataset(newDs, categoryIdx, datasetIdx));
        } else {
            const newAdminDemogDs = Object.assign({}, currentDataset, { [propName]: val }) as AdminDatasetQuery;
            dispatch(setAdminDataset(newAdminDemogDs, true));
        }
    }

    /*
     * Handles any direct changes to SQL input.
     */
    private handleSqlChange = (val: any) => {
        const { dispatch, data } = this.props;
        dispatch(setAdminDatasetSql(val));
    }

    /*
     * Handles clicks to the 'Auto-format' button, which pretty prints SQL.
     */
    private handleAutoFormatClick = () => {
        const { currentDataset } = this.props.data.datasets;
        if (currentDataset) {
            const pretty = formatSql(currentDataset.sql);
            this.handleInputChange(pretty, 'sql');
        }
    }

    /*
     * Computes the width of the SQL container. This is needed because React Ace Editor
     * requires a hard-coded width in order to have predictable size.
     */
    private getSqlWidth = (): number => {
        const max = 800;
        const min = 400;
        const sqlDom = document.getElementsByClassName(`${this.className}-sql`);
        if (sqlDom && sqlDom[0]) {
            const style = window.getComputedStyle(sqlDom[0]);
            if (style) {
                const w = +style.width!.replace('px','');
                const p = +style.paddingLeft!.replace('px','');
                const width = w - (p * 2);
                if (width < min) {
                    return min;
                } else if (width > max) {
                    return max;
                }
                return width;
            }
        }
        return max;
    }

    /*
     * Handles clicks or up/down arrow selections of datasets.
     */
    private handleDatasetSelect = (categoryIdx: number, datasetIdx: number) => {
        const { dispatch, data, datasets } = this.props;

        if (data.datasets.state === AdminPanelLoadState.LOADING) { return; }
        if (data.datasets.changed) {
            const info: InformationModalState = {
                body: "Please save or undo your current changes first.",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
            return;
        }
        const cat = datasets.display[categoryIdx];
        if (cat) {
            const ds = cat.datasets[datasetIdx];
            if (ds) {
                this.setState({ categoryIdx, datasetIdx });
                dispatch(fetchAdminDatasetIfNeeded(ds)); 
            }
        }
    }

    private handleShapeClick = (shape: PatientListDatasetShape) => {
        const { dispatch } = this.props;
        dispatch(setAdminDatasetShape(shape));
    }

    private handleDatasetRequest = () => null;

    private getColumnContent = (col: AdminPanelPatientListColumnTemplate) => {
        const classes = [ `${this.className}-column` ];

        if (col.optional) { classes.push('optional'); }
        if (col.present)  { classes.push('present'); }
        return (
            <div key={col.id} className={classes.join(' ')}>
                <FiCheck />
                <span>{col.id}</span>
            </div>
        );
    }
}