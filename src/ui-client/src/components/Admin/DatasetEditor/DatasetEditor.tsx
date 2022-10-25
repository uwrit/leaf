/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { generate as generateId } from 'shortid';
import { Container, Row, Col, Button } from 'reactstrap';
import AdminState, { AdminPanelLoadState } from '../../../models/state/AdminState';
import { InformationModalState, ConfirmationModalState } from '../../../models/state/GeneralUiState';
import DatasetContainer from '../../PatientList/AddDatasetSelectors/DatasetContainer';
import { DefTemplates, personId, encounterId } from '../../../models/patientList/DatasetDefinitionTemplate';
import { PatientListDatasetShape, PatientListDatasetQuery } from '../../../models/patientList/Dataset';
import { fetchAdminDatasetIfNeeded, setAdminDataset, setAdminDatasetShape, revertAdminDatasetChanges, saveAdminDataset, saveAdminDemographicsDataset, deleteAdminDataset } from '../../../actions/admin/dataset';
import { AdminDatasetQuery, AdminDemographicQuery } from '../../../models/admin/Dataset';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon';
import { showInfoModal, showConfirmationModal } from '../../../actions/generalUi';
import { DatasetsState } from '../../../models/state/AppState';
import { setAdminDatasetSearchMode, moveDatasetCategory, addDataset, setDatasetSelected, setDatasetDisplay } from '../../../actions/datasets';
import { FhirTemplateEditor } from './FhirTemplateEditor/FhirTemplateEditor';
import { DynamicEditor } from './DynamicEditor/DynamicEditor';
import { PatientListColumnType } from '../../../models/patientList/Column';
import { WhatsThis } from '../../Other/WhatsThis/WhatsThis';
import './DatasetEditor.css';

interface Props { 
    data: AdminState;
    datasets: DatasetsState;
    dispatch: any;
}

interface State {
    forceValidation: boolean;
    shapes: PatientListDatasetShape[];
}

export class DatasetEditor extends React.PureComponent<Props,State> {
    private className = 'dataset-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            forceValidation: false,
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
        dispatch(setAdminDatasetSearchMode(true));
    }

    public componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch(setAdminDatasetSearchMode(false));
        dispatch(setAdminDataset(undefined, false, false));
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

                            {/* Dataset list shown on the left */}
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
                        <div className={`${c}-column-right admin-panel-editor scrollable-offset-by-header`}>

                            {/* Failure messages, etc. */}
                            {this.getStatusDependentContent(data.datasets.state, 'concept-editor')}

                            <div className={`${c}-main`}>

                                {/* Header */}
                                {(data.datasets.datasets.size > 0 || currentDataset) &&
                                <div className={`${c}-column-right-header`}>
                                    <Button className='leaf-button leaf-button-addnew' disabled={changed} onClick={this.handleCreateDatasetClick}>+ Create New Dataset</Button>
                                    <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChanges}>Undo Changes</Button>
                                    <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveChanges}>Save</Button>
                                    <Button className='leaf-button leaf-button-warning' disabled={allowDelete} onClick={this.handleDeleteClick}>Delete</Button>

                                    {/* Explanation */}
                                    <WhatsThis 
                                        question={'What is a Dataset?'}
                                        body={`Datasets are the row-level data (and associated SQL queries) for display in the Patient List. The 'Basic Demographics'
                                               Dataset is a special required Dataset which populates the Visualize and inital Patient List screens. Additional Datasets 
                                               can by added by specifying a SQL query (i.e., SELECT... FROM... WHERE...) to retrieve expected fields. Leaf will automatically 
                                               compute per-patient summary statistics and append columns to the Patient List.`}
                                    />
                                </div>
                                }

                                {/* Create a SQL Set link, used at initial setup */}
                                {
                                    data.state === AdminPanelLoadState.LOADED && 
                                    data.datasets.demographicsDataset.unsaved && 
                                    !currentDataset &&
                                <div className={`${c}-start`}>
                                    <p>It looks like you haven't created a Basic Demographics query to populate the Visualize and Patient List screens.</p>
                                    <p>
                                        <span className='link-span' onClick={this.handleInitialBasicDemographicsSetupClick}>
                                            Click here to start creating a SQL query to return demographics data.
                                        </span>
                                    </p>
                                </div>
                                }

                                {/* Hint to click on a Dataset to edit */}
                                {!currentDataset && !data.datasets.demographicsDataset.unsaved &&
                                <div className={`${c}-na`}>
                                    <p>Click on a Dataset to the left to edit <br></br> or <span className='link-span' onClick={this.handleCreateDatasetClick}>create a new one</span></p>
                                </div>
                                }

                                {/* Editor */}
                                {this.getEditor()}
                            </div>
                        </div>
                    </Row>
                </Container>
            </div>
        );
    }

    /*
     * Return React component for the current editor shape.
     */
    private getEditor = () => {
        const { currentDataset } = this.props.data.datasets;

        if (!currentDataset) { 
            return null;
        }

        const { data, dispatch } = this.props;
        const { expectedColumns } = data.datasets;
        const { shapes, forceValidation } = this.state;
        const locked = currentDataset && currentDataset.shape === PatientListDatasetShape.Demographics;
        const currentCategory = currentDataset.categoryId 
            ? data.datasetQueryCategories.categories.get(currentDataset.categoryId)
            : undefined;

        if (currentDataset.shape === PatientListDatasetShape.Dynamic) {
            return (
                <DynamicEditor 
                    categoryChangeHandler={this.handleCategoryChange}
                    category={currentCategory}
                    categories={data.datasetQueryCategories.categories}
                    dataset={currentDataset}
                    dispatch={dispatch}
                    expectedColumns={expectedColumns}
                    forceValidation={forceValidation}
                    inputChangeHandler={this.handleInputChange}
                    locked={locked}
                    shapeChangeHandler={this.handleShapeClick}
                    shape={data.datasets.currentDataset!.shape}
                    shapes={shapes}
                />
            );
        }
        return (
            <FhirTemplateEditor 
                categoryChangeHandler={this.handleCategoryChange}
                category={currentCategory}
                categories={data.datasetQueryCategories.categories}
                dataset={currentDataset}
                dispatch={dispatch}
                expectedColumns={expectedColumns}
                forceValidation={forceValidation}
                inputChangeHandler={this.handleInputChange}
                locked={locked}
                shapeChangeHandler={this.handleShapeClick}
                shape={data.datasets.currentDataset!.shape}
                shapes={shapes}
            />
        );
    };

    /*
     * Handle initial click to create a Basic Demographics query.
     */
    private handleInitialBasicDemographicsSetupClick = () => {
        const { dispatch, data } = this.props;
        dispatch(setAdminDataset(data.datasets.demographicsDataset, true, true));
    }

    /* 
     * Set optional content.
     */
    private getStatusDependentContent = (state: AdminPanelLoadState, c: string) => {
        const { data } = this.props;
        if (state === AdminPanelLoadState.LOADING) {
            return (
                <div>
                    <div className={`${c}-loading`}>
                        <LoaderIcon size={100} />
                    </div>
                    <div className={`${c}-loading-overlay`}/>
                </div>
            );
        } else if (state === AdminPanelLoadState.ERROR && !data.datasets.currentDataset) {
            return (
                <div className={`${c}-error`}>
                    <p>Leaf encountered an error while trying to fetch this dataset.</p>
                </div>
            );
        }
        return null;
    }

    /*
     * Validate that current admin Concept is valid. Called on 'Save' click.
     */
    private currentDatasetIsValid = () => {
        const { currentDataset } = this.props.data.datasets;

        if (!currentDataset) { return 'There is no current dataset'; }
        if (!currentDataset.name) { return 'No [Name] has been entered'; }
        for (const constraint of currentDataset.constraints) {
            if (!constraint.constraintValue) { return 'One or more [Access Restrictions] is missing a User or Group'; }
        }
        if (currentDataset.shape === PatientListDatasetShape.Dynamic) {
            if (currentDataset.isEncounterBased) {
                if (!currentDataset.sqlFieldDate) { return '[Has Encounters] is set to "true" but no [Date Column] has been selected'; }
                if (!currentDataset.sqlFieldValueString) { return '[Has Encounters] is set to "true" but no [String Value Column] has been selected'; }
            }
            for (const field of currentDataset.schema!.fields) {
                if (field.type === PatientListColumnType.DateTime && (!field.mask || !field.phi)) {
                    return `The [${field.name}] column is a DateTime but isn't set to "De-identify". Proceeding may inadvertently reveal Protected Health Information`;
                }
                if ((field.name === personId || field.name === encounterId) && (!field.mask || !field.phi)) {
                    return `The [${field.name}] column is a potentially identifiable and should always be set to "De-identify"`;
                }
            }
        }

        /*
         * No need to check the [sqlStatement], as the missing SQL column
         * check following this will return granular information on those.
         */
        return null;
    }

    /*
     * Trigger a fallback to unedited, undoing any current changes.
     */
    private handleUndoChanges = () => {
        const { datasets} = this.props.data;
        const { dispatch } = this.props;
        dispatch(revertAdminDatasetChanges(datasets.currentDataset!));
        this.setState({ forceValidation: false });
    }

    /*
     * Handle initiation of saving async changes and syncing with the DB.
     */
    private handleSaveChanges = () => {
        const { datasets } = this.props.data;
        const { dispatch } = this.props;
        const missingCols = datasets.currentDataset!.shape === PatientListDatasetShape.Dynamic
            ? datasets.currentDataset!.schema!.fields.filter((c) => !c.present).map((c) => `[${c.name}]`)
            : datasets.expectedColumns.filter((c) => !c.optional && !c.present).map((c) => `[${c.id}]`);
        const errors = this.currentDatasetIsValid();
        
        /*
         * It's valid and has no missing columns, so save.
         */
        if (!errors && !missingCols.length) {
            if (datasets.currentDataset!.shape === PatientListDatasetShape.Demographics) {
                dispatch(saveAdminDemographicsDataset(datasets.currentDataset! as AdminDemographicQuery))
            } else {
                dispatch(saveAdminDataset(datasets.currentDataset!));
            }

        /*
         * One or more fields are missing data.
         */
        } else if (errors) {
            const confirm: ConfirmationModalState = {
                body: [
                    <p key={1}>{errors}.</p>,
                    <p key={2}>Are you sure you want to try to save this Dataset? The save or query execution process may fail due to missing data.</p>
                ],
                header: 'Missing Dataset data',
                onClickNo: () => null as any,
                onClickYes: () => { 
                    if (datasets.currentDataset!.shape === PatientListDatasetShape.Demographics) {
                        dispatch(saveAdminDemographicsDataset(datasets.currentDataset! as AdminDemographicQuery))
                    } else {
                        dispatch(saveAdminDataset(datasets.currentDataset!));
                    }
                    this.setState({ forceValidation: false });
                },
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Save Dataset`
            };
            dispatch(showConfirmationModal(confirm));
            this.setState({ forceValidation: true });

        /*
         * One or more expected columns are missing.
         */
        } else if (missingCols.length) {
            const confirm: ConfirmationModalState = {
                body: [
                    <p key={1}>Your current SQL Query appears to be missing the following required columns: {missingCols.join(', ')}. </p>,
                    <p key={2}>Are you sure you want to save the current dataset? If not all expected columns are returned after running the query,
                       Leaf will throw an error in the Patient List.</p>
                ],
                header: 'Potential missing columns',
                onClickNo: () => null as any,
                onClickYes: () => { 
                    if (datasets.currentDataset!.shape === PatientListDatasetShape.Demographics) {
                        dispatch(saveAdminDemographicsDataset(datasets.currentDataset! as AdminDemographicQuery))
                    } else {
                        dispatch(saveAdminDataset(datasets.currentDataset!));
                    }
                },
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, I'm sure`
            };
            dispatch(showConfirmationModal(confirm));
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
            isEncounterBased: false,
            isDefault: false,
            category: newAdminDs.categoryId ? datasetQueryCategories.categories.get(newAdminDs.categoryId)!.category : ''
        };

        dispatch(setDatasetDisplay(newDs));
        dispatch(setAdminDataset(newAdminDs, true, false));
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
            dispatch(setAdminDataset(adminDs, true, false));
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
    private handleDatasetRequest = () => null as any;

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
            onClickNo: () => null as any,
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
        const shape = PatientListDatasetShape.Dynamic;
        const newAdminDs: AdminDatasetQuery = {
            id,
            constraints: [],
            isEncounterBased: true,
            name,
            shape,
            sqlStatement: `SELECT   FROM dbo.table`,
            tags: [],
            unsaved: true
        };
        const newUserDs: PatientListDatasetQuery = {
            id,
            isEncounterBased: true,
            category: '',
            name,
            shape,
            tags: [],
            unsaved: true
        };
        dispatch(addDataset(newUserDs));
        dispatch(setAdminDataset(newAdminDs, true, true));
        dispatch(setDatasetSelected(newUserDs));
    }
}