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
import './DatasetEditor.css';
import { SqlBox } from '../../Other/SqlBox/SqlBox';
import { Section } from '../ConceptEditor/Sections/Section';
import { DefTemplates } from '../../../models/patientList/DatasetDefinitionTemplate';
import { PatientListDatasetShape, PatientListDatasetDefinitionTemplate } from '../../../models/patientList/Dataset';
import { PatientListColumnTemplate, PatientListColumnType } from '../../../models/patientList/Column';

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
        const { currentDataset, changed, state } = data.datasets;
        const { templates } = this.state;
        const c = this.className;
        const cols: PatientListColumnTemplate[] = [{ id: 'personId', type: PatientListColumnType.string }];
        
        if (currentDataset) {
            const template = DefTemplates.get(currentDataset.shape);
            if (template) {
                template.columns.forEach((c) => cols.push(c));
            }
        }
        
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

                                <div className={`${c}-sql-column-container`}>
                                    <div className={`${c}-sql`}>
                                        <Section header='SQL'>
                                            {currentDataset &&
                                            <SqlBox sql={currentDataset.sql} height={700} width={550} readonly={false} changeHandler={this.handleChange}/>
                                            }
                                        </Section>
                                    </div>
                                    <div className={`${c}-sql-right`}>
                                        <Section header='Columns'>
                                            <div className={`${c}-column-container`}>
                                                {cols.map((c) => <div key={c.id}>{c.id}</div>)}
                                            </div>
                                        </Section>
                                        <Section header='Dataset Shapes'>
                                            <div className={`${c}-shape-container`}>
                                                {templates.map((t) => <div key={t.shape}>{PatientListDatasetShape[t.shape]}</div>)}
                                            </div>
                                        </Section>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Row>
                </Container>
            </div>
        );
    }

    private handleChange = (value: string, evt: any) => {
        console.log(value, evt);
    }

    private handleDatasetSelect = (categoryIdx: number, datasetIdx: number) => {
        this.setState({ categoryIdx, datasetIdx });
    }

    private handleDatasetRequest = () => null;
}