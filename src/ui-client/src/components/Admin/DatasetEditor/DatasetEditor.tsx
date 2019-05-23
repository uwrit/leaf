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
import { PatientListDatasetShape, PatientListDatasetDefinitionTemplate } from '../../../models/patientList/Dataset';
import { AdminPanelPatientListColumnTemplate } from '../../../models/patientList/Column';
import { AdminDatasetQuery } from '../../../models/admin/Dataset';
import { setAdminDataset, setAdminPanelDatasetColumns, fetchAdminDatasetIfNeeded } from '../../../actions/admin/dataset';
import { FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { getSqlColumns } from '../../../utils/parseSql';
import './DatasetEditor.css';

interface Props { 
    data: AdminState;
    datasets: DatasetsState;
    dispatch: any;
}

interface State {
    categoryIdx: number;
    datasetIdx: number;
    templates: PatientListDatasetDefinitionTemplate[];
}

export class DatasetEditor extends React.PureComponent<Props,State> {
    private className = 'dataset-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            categoryIdx: 0,
            datasetIdx: 0,
            templates: []
        }
    }

    public componentDidMount() {
        const templates: PatientListDatasetDefinitionTemplate[] = [];
        DefTemplates.forEach((t) => {
            if (t.shape !== PatientListDatasetShape.Demographics) {
                templates.push(t);
            }
        });
        this.setState({ templates });
    }

    public render() {
        const { data, datasets, dispatch } = this.props;
        const { categoryIdx, datasetIdx } = this.state;
        const { currentDataset, changed, state, columns } = data.datasets;
        const { templates } = this.state;
        const c = this.className;
        
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

                                <Row>
                                    <Col md={12} className={`${c}-sql`}>
                                        <Section header='SQL'>
                                            <SqlBox 
                                                sql={currentDataset!.sql} 
                                                height={300} 
                                                width={this.getWidth()} 
                                                readonly={false} 
                                                changeHandler={this.handleSqlChange}
                                            />
                                        </Section>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Section header='Columns'>
                                            <div className={`${c}-column-container`}>
                                                {columns.map((c) => this.setColumn(c))}
                                            </div>
                                        </Section>
                                    </Col>
                                    <Col md={6}>
                                        <Section header='Dataset Shapes'>
                                            <div className={`${c}-shape-container`}>
                                                {templates.map((t) => this.setShape(t, currentDataset!.shape))}
                                            </div>
                                        </Section>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Row>
                </Container>
            </div>
        );
    }

    /*
     * The Ace Editor needs an explicit width, so this computes the width 
     * of the container DOM object around it, minus padding.
     */
    private getWidth = () => {
        const main = document.getElementsByClassName(`${this.className}-main`);
        const dflt = 800;
        const scrollWidth = 25;

        if (main && main[0]) {
            const computed = window.getComputedStyle(main[0]);
            const paddingLeftStr = computed.paddingLeft;
            const widthStr = computed.width;
            if (paddingLeftStr && widthStr) {
                const paddingLeft = +paddingLeftStr.replace('px','');
                const width = +widthStr.replace('px','');
                return width - (paddingLeft * 2) - scrollWidth;
            }
        }
        return dflt;
    }

    /* 
     * Handles tracking of input changes to the Dataset, generating cloned, updated
     * copies and dispatching to the store.
     */
    private handleInputChange = (val: any, propName: string) => {
        const { dispatch, data } = this.props;
        const newDataset = Object.assign({}, data.datasets.currentDataset, { [propName]: val }) as AdminDatasetQuery;

        dispatch(setAdminDataset(newDataset, true));
    }

    /* 
     * Handles 
     */
    private handleSqlChange = (val: string) => {
        const { dispatch, data } = this.props;
        const { columns, currentDataset } = this.props.data.datasets;
        const returned = new Set(getSqlColumns(val));

        for (let i = 0; i < columns.length; i++) {
            const col = columns[i];
            const present = returned.has(col.id);
            if (present !== col.present) {
                columns[i] = Object.assign({}, col, { present });
            }
        }
        
        const newDataset = Object.assign({}, 
            data.datasets.currentDataset, { 
                columns: columns.slice(),
                sql: val,
            },
        ) as AdminDatasetQuery;
        dispatch(setAdminDataset(newDataset, true));
    }

    private handleDatasetSelect = (categoryIdx: number, datasetIdx: number) => {
        const { dispatch, datasets } = this.props;
        this.setState({ categoryIdx, datasetIdx });
        const dataset = datasets.available[categoryIdx].datasets[datasetIdx];

        dispatch(fetchAdminDatasetIfNeeded(dataset));
    }

    private handleDatasetRequest = () => null;

    private handleShapeClick = (shape: PatientListDatasetShape) => {
        const { dispatch, data } = this.props;
        const { currentDataset, columns } = data.datasets;
        const template = DefTemplates.get(shape);
        const returned = new Set(getSqlColumns(currentDataset!.sql));

        if (!template) { return; }

        const cols: AdminPanelPatientListColumnTemplate[] = [];
        template.columns.forEach((col) => {
            const present = returned.has(col.id);
            cols.push({ ...col, present });
        });

        this.handleInputChange(shape, 'shape');
        dispatch(setAdminPanelDatasetColumns(cols));
    }

    private setColumn = (col: AdminPanelPatientListColumnTemplate) => {
        const c = this.className;
        const classes = [ `${c}-column` ];
        let icon = null;

        if (col.present) {
            classes.push('present');
            icon = <FiCheck className='present' />;
        } else if (!col.optional) {
            classes.push('missing');
            icon = <FiAlertTriangle className='missing' />;
        }
        if (col.optional) {
            classes.push('optional');
        }

        return (
            <div key={col.id} className={classes.join(' ')}>
                {icon}
                {col.id}
            </div>
        );
    }

    private setShape = (template: PatientListDatasetDefinitionTemplate, currentShape: PatientListDatasetShape) => {
        const c = this.className;
        const classes = [ `${c}-shape` ];

        if (template.shape === currentShape) {
            classes.push('selected');
        }

        return (
            <div key={template.shape} className={classes.join(' ')} onClick={this.handleShapeClick.bind(null, template.shape)}>
                {PatientListDatasetShape[template.shape]}
            </div>
        );
    }
}