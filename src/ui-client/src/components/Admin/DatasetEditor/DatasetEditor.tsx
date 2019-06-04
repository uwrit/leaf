/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import AdminState, { AdminPanelLoadState } from '../../../models/state/AdminState';
import { InformationModalState, ConfirmationModalState } from '../../../models/state/GeneralUiState';
import DatasetContainer from '../../PatientList/AddDatasetSelectors/DatasetContainer';
import { SqlBox } from '../../Other/SqlBox/SqlBox';
import { Section } from '../ConceptEditor/Sections/Section';
import { DefTemplates } from '../../../models/patientList/DatasetDefinitionTemplate';
import { PatientListDatasetShape, PatientListDatasetQuery } from '../../../models/patientList/Dataset';
import { AdminPanelPatientListColumnTemplate } from '../../../models/patientList/Column';
import { fetchAdminDatasetIfNeeded, setAdminDataset, setAdminDatasetShape, setAdminDatasetSql, revertAdminDatasetChanges, saveAdminDataset, saveAdminDemographicsDataset, deleteAdminDataset } from '../../../actions/admin/dataset';
import { AdminDatasetQuery } from '../../../models/admin/Dataset';
import { FiCheck } from 'react-icons/fi';
import { ShapeDropdown } from './ShapeDropdown/ShapeDropdown';
import formatSql from '../../../utils/formatSql';
import { TextArea } from '../ConceptEditor/Sections/TextArea';
import { Constraints } from './Constraints/Constraints';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon';
import { CategoryDropdown } from './CategoryDropdown/CategoryDropdown';
import { Tagger } from './Tagger/Tagger';
import { showInfoModal, showConfirmationModal } from '../../../actions/generalUi';
import { DatasetsState } from '../../../models/state/AppState';
import { allowDemographicsDatasetInSearch, moveDatasetCategory, setDatasetDisplay, addDataset } from '../../../actions/datasets';
import { generate as generateId } from 'shortid';
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

    public getSnapshotBeforeUpdate(prevProps: Props) {
        const { datasets, data } = this.props;
        if (data.datasets.currentDataset && prevProps.datasets.display !== datasets.display) {
            this.updateDatasetIndexes();
        }

        return null;
    }

    public componentDidUpdate() { }

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
        const allowDelete = !currentDataset || currentDataset.shape === PatientListDatasetShape.Demographics;
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
                                    <Button className='leaf-button leaf-button-addnew' disabled={changed} onClick={this.handleCreateDatasetClick}>+ Create New Dataset</Button>
                                    <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChanges}>Undo Changes</Button>
                                    <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveChanges}>Save</Button>
                                    <Button className='leaf-button leaf-button-warning' disabled={allowDelete} onClick={this.handleDeleteClick}>Delete</Button>
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
                                changeHandler={this.handleCategoryChange} 
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
     * Set optional content.
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
     * Trigger a fallback to unedited, undoing any current changes.
     */
    private handleUndoChanges = () => {
        const { datasets} = this.props.data;
        const { dispatch } = this.props;
        dispatch(revertAdminDatasetChanges(datasets.currentDataset!));
    }

    /*
     * Handle initiation of saving async changes and syncing with the DB.
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
     * Handle tracking of input changes to the Dataset.
     */
    private handleInputChange = (val: any, propName: string) => {
        const { data, datasets, dispatch } = this.props;
        const { datasetQueryCategories } = data;
        const { currentDataset } = data.datasets;
        const { categoryIdx, datasetIdx } = this.state;

        const newAdminDs = Object.assign({}, currentDataset, { [propName]: val }) as AdminDatasetQuery;
        const userDs = datasets.allMap.get(currentDataset!.id);
        const newDs: PatientListDatasetQuery = {
            ...userDs,
            ...newAdminDs,
            category: newAdminDs.categoryId ? datasetQueryCategories.categories.get(newAdminDs.categoryId)!.category : ''
        };

        dispatch(setAdminDataset(newAdminDs, true));
        dispatch(setDatasetDisplay(newDs, categoryIdx, datasetIdx));
    }

    /*
     * Handle any direct changes to SQL input.
     */
    private handleSqlChange = (val: any) => {
        const { dispatch } = this.props;
        dispatch(setAdminDatasetSql(val));
    }

    /*
     * Handle changes to the Category dropdown.
     */
    private handleCategoryChange = (categoryId: number, propName: string) => {
        const { data, dispatch, datasets } = this.props;
        const { currentDataset } = data.datasets;
        const { categoryIdx, datasetIdx } = this.state;

        if (currentDataset!.categoryId !== categoryId) {
            const newCategory = data.datasetQueryCategories.categories.get(categoryId);
            const newCategoryText = newCategory ? newCategory.category : '';
            const hadCategory = Boolean(currentDataset!.categoryId);

            const adminDs: AdminDatasetQuery = Object.assign({}, currentDataset, { categoryId });
            const userDs = datasets.allMap.get(currentDataset!.id);
            const ds: PatientListDatasetQuery = {
                ...userDs,
                ...currentDataset!,
                category: hadCategory
                    ? data.datasetQueryCategories.categories.get(currentDataset!.categoryId!)!.category
                    : ''
            }
            dispatch(setDatasetDisplay(ds, categoryIdx, datasetIdx));
            dispatch(moveDatasetCategory(ds, newCategoryText));
            dispatch(setAdminDataset(adminDs, true));
        }
    }

    /*
     * Update current dataset index after category change.
     */
    private updateDatasetIndexes = () => {
        const { data, datasets } = this.props;
        const { currentDataset } = data.datasets;
        const hasCategory = Boolean(currentDataset!.categoryId);
        const categoryText = hasCategory
            ? data.datasetQueryCategories.categories.get(currentDataset!.categoryId!)!.category
            : ''
        const categoryIdx = datasets.display.findIndex((cat) => cat.category === categoryText);
        if (categoryIdx > -1) {
            const datasetIdx = datasets.display[categoryIdx].datasets.findIndex((ds) => ds.id === currentDataset!.id);
            if (datasetIdx > -1) {
                this.setState({ categoryIdx, datasetIdx });
            }
        }
    }

    /*
     * Handle clicks to the 'Auto-format' button, which pretty prints SQL.
     */
    private handleAutoFormatClick = () => {
        const { currentDataset } = this.props.data.datasets;
        if (currentDataset) {
            const pretty = formatSql(currentDataset.sql);
            this.handleInputChange(pretty, 'sql');
        }
    }

    /*
     * Compute the width of the SQL container. This is needed because React Ace Editor
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
     * Handle clicks or up/down arrow selections of datasets.
     */
    private handleDatasetSelect = (categoryIdx: number, datasetIdx: number) => {
        const { dispatch, data, datasets } = this.props;
        const { changed } = data.datasets;

        if (data.datasets.state === AdminPanelLoadState.LOADING) { return; }
        if (changed && datasetIdx === -1) { return; }
        if (changed) {
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

    /*
     * Handle changes to the dataset shape.
     */
    private handleShapeClick = (shape: PatientListDatasetShape) => {
        const { dispatch } = this.props;
        dispatch(setAdminDatasetShape(shape));
    }

    /*
     * Dummy function to satisfy dataset 'requests' if the 
     * user hits enter. This function is used in the Patient List
     * but serves no use in the Admin Panel.
     */
    private handleDatasetRequest = () => null;

    /*
     * Get React elements depending on whether columns are present, optional, etc.
     */
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

    /*
     * Handle 'delete' button clicks.
     */
    private handleDeleteClick = () => {
        const { dispatch, data } = this.props;
        const { currentDataset } = data.datasets;

        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the Dataset, "${currentDataset!.name}" (id: ${currentDataset!.id})? ` +
                  `This will take effect immediately and can't be undone.`,
            header: 'Delete Dataset',
            onClickNo: () => null,
            onClickYes: () => { 
                dispatch(deleteAdminDataset(currentDataset!)); 
                this.setState({ categoryIdx: 0, datasetIdx: -1 }) 
            },
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Delete Dataset`
        };
        dispatch(showConfirmationModal(confirm));
    }

    /*
     * Handle 'Create New Dataset' button clicks.
     */
    private handleCreateDatasetClick = () => {
        const { dispatch } = this.props;
        const id = generateId();
        const name = 'New Dataset';
        const shape = PatientListDatasetShape.Allergy;
        const newAdminDs: AdminDatasetQuery = {
            id,
            constraints: [],
            name,
            shape,
            sql: '',
            tags: [],
            unsaved: true
        };
        const newUserDs: PatientListDatasetQuery = {
            id,
            category: '',
            name,
            shape,
            tags: [],
            unsaved: true
        };
        dispatch(addDataset(newUserDs));
        dispatch(setAdminDataset(newAdminDs, false));
        dispatch(setAdminDataset(newAdminDs, true));
        dispatch(setAdminDatasetSql('SELECT FROM dbo.table'));
    }
}