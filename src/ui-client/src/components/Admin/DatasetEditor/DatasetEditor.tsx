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
import { Section } from '../Section/Section';
import { DefTemplates } from '../../../models/patientList/DatasetDefinitionTemplate';
import { PatientListDatasetShape, PatientListDatasetQuery } from '../../../models/patientList/Dataset';
import { fetchAdminDatasetIfNeeded, setAdminDataset, setAdminDatasetShape, setAdminDatasetSql, revertAdminDatasetChanges, saveAdminDataset, saveAdminDemographicsDataset, deleteAdminDataset } from '../../../actions/admin/dataset';
import { AdminDatasetQuery } from '../../../models/admin/Dataset';
import { Constraints } from './Constraints/Constraints';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon';
import { showInfoModal, showConfirmationModal } from '../../../actions/generalUi';
import { DatasetsState } from '../../../models/state/AppState';
import { allowDemographicsDatasetInSearch, moveDatasetCategory, addDataset, setDatasetSelected, setDatasetDisplay } from '../../../actions/datasets';
import { generate as generateId } from 'shortid';
import { Display } from './Sections/Display';
import { SqlEditor } from './Sections/SqlEditor';
import { Identifiers } from './Sections/Identifiers';
import './DatasetEditor.css';

interface Props { 
    data: AdminState;
    datasets: DatasetsState;
    dispatch: any;
}

interface State {
    shapes: PatientListDatasetShape[];
}

export class DatasetEditor extends React.PureComponent<Props,State> {
    private className = 'dataset-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
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
                                datasets={datasets}
                                dispatch={dispatch}
                                handleDatasetSelect={this.handleDatasetSelect}
                                handleDatasetRequest={this.handleDatasetRequest}
                                searchEnabled={!changed}
                                selected={datasets.selected}
                            />
                        </Col>
                        <div className={`${c}-column-right admin-panel-editor`}>
                            {this.getStatusDependentContent(data.datasets.state, 'concept-editor')}
                            <div className={`${c}-main`}>

                                {/* New, Undo, Save, Delete buttons */}
                                {datasets.display.size > 0 &&
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
        const locked = currentDataset && currentDataset.shape === PatientListDatasetShape.Demographics;
        const c = this.className;
        let currentCategory = undefined;

        if (dataset && dataset.categoryId) {
            currentCategory = data.datasetQueryCategories.categories.get(dataset.categoryId);
        }

        return (
           <div>
                <Display
                    categoryChangeHandler={this.handleCategoryChange}
                    category={currentCategory}
                    categories={data.datasetQueryCategories.categories}
                    dataset={dataset}
                    dispatch={dispatch}
                    inputChangeHandler={this.handleInputChange}
                    locked={locked}
                    shapeChangeHandler={this.handleShapeClick}
                    shape={data.datasets.currentDataset!.shape}
                    shapes={shapes}
                />
                <SqlEditor
                    dataset={currentDataset}
                    dispatch={dispatch}
                    expectedColumns={expectedColumns}
                    handleInputChange={this.handleInputChange}
                />
                <Row>
                    <Col md={6}>
                        <Identifiers
                            dataset={currentDataset}
                            handleInputChange={this.handleInputChange}
                        />
                    </Col>
                    <Col md={6}>
                        {/*
                        <Section header='Access Restrictions'>
                            <Constraints dataset={dataset} changeHandler={this.handleInputChange} locked={locked}/>
                        </Section>
                        */}
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

        const newAdminDs = Object.assign({}, currentDataset, { [propName]: val }) as AdminDatasetQuery;
        const userDs = datasets.all.get(currentDataset!.id);
        const newDs: PatientListDatasetQuery = {
            ...userDs,
            ...newAdminDs,
            category: newAdminDs.categoryId ? datasetQueryCategories.categories.get(newAdminDs.categoryId)!.category : ''
        };

        dispatch(setDatasetDisplay(newDs));
        dispatch(setAdminDataset(newAdminDs, true));
    }

    /*
     * Handle changes to the Category dropdown.
     */
    private handleCategoryChange = (categoryId: number) => {
        const { data, dispatch, datasets } = this.props;
        const { currentDataset } = data.datasets;

        if (currentDataset!.categoryId !== categoryId) {
            const newCategory = data.datasetQueryCategories.categories.get(categoryId);
            const newCategoryText = newCategory ? newCategory.category : '';
            const hadCategory = Boolean(currentDataset!.categoryId);

            const adminDs: AdminDatasetQuery = Object.assign({}, currentDataset, { categoryId });
            const userDs = datasets.all.get(currentDataset!.id);
            const ds: PatientListDatasetQuery = {
                ...userDs,
                ...currentDataset!,
                category: hadCategory
                    ? data.datasetQueryCategories.categories.get(currentDataset!.categoryId!)!.category
                    : ''
            }
            dispatch(moveDatasetCategory(ds, newCategoryText));
            dispatch(setAdminDataset(adminDs, true));
        }
    }

    /*
     * Handle clicks or up/down arrow selections of datasets.
     */
    private handleDatasetSelect = (dataset: PatientListDatasetQuery) => {
        const { dispatch, data } = this.props;
        const { changed } = data.datasets;

        if (data.datasets.state === AdminPanelLoadState.LOADING) { return; }
        if (changed) {
            const info: InformationModalState = {
                body: "Please save or undo your current changes first.",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
            return;
        }

        dispatch(setDatasetSelected(dataset));
        dispatch(fetchAdminDatasetIfNeeded(dataset));
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
            sqlStatement: '',
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

    private sqlMeetsRequirements = (): boolean => {
        const { sqlColumns, currentDataset, expectedColumns } = this.props.data.datasets;
        if (!currentDataset) { return false; }

        const missingCols = expectedColumns.filter((c) => !c.optional && !sqlColumns.has(c.id));
        if (missingCols.length) {
            return false;
        }
        return true;
    }
}