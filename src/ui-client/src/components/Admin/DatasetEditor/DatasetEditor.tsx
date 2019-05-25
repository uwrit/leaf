/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import AdminState from '../../../models/state/AdminState';
import { DatasetsState } from '../../../models/state/GeneralUiState';
import DatasetContainer from '../../PatientList/AddDatasetSelectors/DatasetContainer';
import { SqlBox } from '../../Other/SqlBox/SqlBox';
import { Section } from '../ConceptEditor/Sections/Section';
import { DefTemplates } from '../../../models/patientList/DatasetDefinitionTemplate';
import { PatientListDatasetShape, PatientListDatasetQueryDTO } from '../../../models/patientList/Dataset';
import { AdminPanelPatientListColumnTemplate } from '../../../models/patientList/Column';
import { fetchAdminDatasetIfNeeded, setAdminDataset, setAdminDatasetShape, setAdminDatasetSql } from '../../../actions/admin/dataset';
import { AdminDatasetQuery } from '../../../models/admin/Dataset';
import { FiCheck } from 'react-icons/fi';
import { ShapeDropdown } from './ShapeDropdown/ShapeDropdown';
import formatSql from '../../../utils/formatSql';
import { TextArea } from '../ConceptEditor/Sections/TextArea';
import { setPatientListDatasetByIndex } from '../../../actions/generalUi';
import './DatasetEditor.css';
import { Constraints } from './Constraints/Constraints';

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
            datasetIdx: 0,
            shapes: []
        }
    }

    public componentDidMount() {
        let shapes: PatientListDatasetShape[] = [];

        DefTemplates.forEach((t) => {
            if (t.shape !== PatientListDatasetShape.Demographics) {
                shapes.push(t.shape);
            }
            shapes = shapes.sort((a,b) => PatientListDatasetShape[a] > PatientListDatasetShape[b] ? 1 : -1);
        });
        this.setState({ shapes });
    }

    public render() {
        const { data, datasets, dispatch } = this.props;
        const { categoryIdx, datasetIdx, } = this.state;
        const { currentDataset, changed, state } = data.datasets;
        const { shapes } = this.state;
        const c = this.className;
        const sqlWidth = this.getSqlWidth();
        const shape: PatientListDatasetShape = currentDataset ? currentDataset.shape : PatientListDatasetShape.Dynamic;
        
        return (
            <div className={c}>
                <Container fluid={true}>
                    <Row className={`${c}-container-row`}>
                        <Col md={4} lg={4} xl={5} className={`${c}-column-left`}>
                            <DatasetContainer 
                                categoryIdx={categoryIdx}
                                datasetIdx={datasetIdx}
                                datasets={datasets}
                                dispatch={dispatch}
                                handleDatasetSelect={this.handleDatasetSelect}
                                handleDatasetRequest={this.handleDatasetRequest}
                            />
                        </Col>
                        <div className={`${c}-column-right`}>
                            <div className={`${c}-main`}>

                                <div className={`${c}-column-right-header`}>
                                    <Button className='leaf-button leaf-button-addnew' disabled={changed}>+ Create New Dataset</Button>
                                    <Button className='leaf-button leaf-button-secondary' disabled={!changed}>Undo Changes</Button>
                                    <Button className='leaf-button leaf-button-primary' disabled={!changed}>Save</Button>
                                    <Button className='leaf-button leaf-button-warning'>Delete Dataset</Button>
                                </div>

                                <Section header='Dataset'>
                                    {currentDataset && 
                                        <div>
                                            <Row>
                                                <Col md={4}>
                                                <TextArea 
                                                    changeHandler={this.handleInputChange} propName={'name'} value={currentDataset.name}
                                                    label='Name' required={true}
                                                />
                                                </Col>
                                                <Col md={4}>
                                                    <TextArea 
                                                        changeHandler={this.handleInputChange} propName={'category'} value={currentDataset.category}
                                                        label='Category'
                                                    />
                                                </Col>
                                                <Col md={4}>
                                                    <ShapeDropdown dispatch={dispatch} shapes={shapes} selected={shape} clickHandler={this.handleShapeClick}/>
                                                </Col>
                                            </Row>

                                            <div className={`${c}-sql-container`}>
                                                <div className={`${c}-column-container`}>
                                                    {data.datasets.expectedColumns.map((col) => this.getColumnContent(col))}
                                                </div>
                                                <div className={`${c}-sql`}>
                                                    <SqlBox sql={currentDataset.sql} height={400} width={sqlWidth} readonly={false} changeHandler={this.handleSqlChange}/>
                                                    <div className={`${c}-sql-autoformat`} onClick={this.handleAutoFormatClick}>Auto-format</div>
                                                </div>
                                            </div>

                                            <Constraints dataset={currentDataset} changeHandler={this.handleInputChange} />
                                        </div>
                                    }

                                </Section>
                            </div>
                        </div>
                    </Row>
                </Container>
            </div>
        );
    }

    /* 
     * Handles tracking of input changes to the Dataset.
     */
    private handleInputChange = (val: any, propName: string) => {
        const { currentDataset } = this.props.data.datasets;
        const { categoryIdx, datasetIdx } = this.state;
        const { dispatch } = this.props;

        const newAdminDs = Object.assign({}, currentDataset, { [propName]: val }) as AdminDatasetQuery;
        const newDs: PatientListDatasetQueryDTO = {
            ...newAdminDs,
            category: newAdminDs.category ? newAdminDs.category : ''
        };

        dispatch(setAdminDataset(newAdminDs, true));
        dispatch(setPatientListDatasetByIndex(newDs, categoryIdx, datasetIdx));
    }

    /*
     * Handles any direct changes to SQL input.
     */
    private handleSqlChange = (val: any) => {
        const { dispatch } = this.props;
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
        const { dispatch, datasets } = this.props;
        this.setState({ categoryIdx, datasetIdx });
        const ds = datasets.available[categoryIdx].datasets[datasetIdx];
        if (ds) { dispatch(fetchAdminDatasetIfNeeded(ds)); }
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