/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Row, Button } from 'reactstrap';
import { getPatientListDataset } from '../../../actions/cohort/patientList';
import { DateBoundary } from '../../../models/panel/Date';
import { PatientListConfiguration } from '../../../models/patientList/Configuration';
import DatasetContainer from './DatasetContainer';
import { DatasetsState } from '../../../models/state/AppState';

interface Props {
    categoryIdx: number;
    className?: string;
    configuration: PatientListConfiguration;
    datasetIdx: number;
    dates: DateBoundary[];
    datasets: DatasetsState;
    dispatch: any;
    handleDatasetSelect: (categoryIdx: number, datasetIdx: number) => void;
    handleDateSelect: (date: DateBoundary) => void;
    selectedDates: DateBoundary;
}

export default class AddDatasetSelectors extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { categoryIdx, datasetIdx, datasets, className, dates, dispatch, handleDatasetSelect } = this.props;
        const c = className ? className : 'patientlist-add-dataset';
        return (
            <div>
                <Row>
                    <Col md={7} className={`${c}-select-col-left`}>
                        <DatasetContainer 
                            categoryIdx={categoryIdx}
                            datasetIdx={datasetIdx}
                            datasets={datasets}
                            dispatch={dispatch}
                            handleDatasetSelect={handleDatasetSelect}
                            handleDatasetRequest={this.handleDatasetRequest}
                        />
                    </Col>
                    <Col md={5} className={`${c}-select-col-right`}>
                        {dates.map((d: DateBoundary) => {
                            return (
                                <div 
                                    key={d.display} 
                                    className={this.setDateOptionClass(d)}
                                    onClick={this.handleDateOptionClick.bind(null, d)}
                                    tabIndex={0}>
                                    {d.display}
                                </div>
                            );
                        })}
                    </Col>
                </Row>
                <div className={`${c}-select-footer`}>
                    <Button 
                        className="leaf-button leaf-button-primary" 
                        disabled={datasets.available.length === 0}
                        onClick={this.handleDatasetRequest}
                        style={{ float: 'right' }}>
                        Add Dataset
                    </Button>
                </div>
            </div>
        )
    }

    private handleDateOptionClick = (opt: DateBoundary) => {
        const { handleDateSelect } = this.props;
        handleDateSelect(opt);
    }

    private setDateOptionClass = (date: DateBoundary) => {
        const { className, selectedDates } = this.props;
        return `${className}-select-date-option ${date === selectedDates ? 'selected' : ''}`
    }

    private handleDatasetRequest = () => {
        const { datasets, categoryIdx, datasetIdx, selectedDates, dispatch, handleDatasetSelect } = this.props;
        const cat = datasets.available[categoryIdx];
        const ds = cat ? cat.datasets[datasetIdx] : undefined;

        if (ds) {
            dispatch(getPatientListDataset(ds, selectedDates));
            handleDatasetSelect(0,0);
        }
    }
}
