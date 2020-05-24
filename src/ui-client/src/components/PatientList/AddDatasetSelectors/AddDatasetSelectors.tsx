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
import { PatientListDatasetQuery } from '../../../models/patientList/Dataset';

interface Props {
    className?: string;
    configuration: PatientListConfiguration;
    dates: DateBoundary[];
    datasets: DatasetsState;
    dispatch: any;
    handleClickClose: () => void;
    handleDatasetSelect: (dataset: PatientListDatasetQuery) => void;
    handleByEncounterSelect: () => void;
    handleDateSelect: (date: DateBoundary) => void;
    selectedDates: DateBoundary;
    showDates: boolean;
}

export default class AddDatasetSelectors extends React.PureComponent<Props> {
    public render() {
        const { datasets, className, dates, dispatch, handleByEncounterSelect, handleDatasetSelect, handleClickClose, showDates } = this.props;
        const c = className ? className : 'patientlist-add-dataset';
        return (
            <div className={c}>
                <Row>
                    <Col md={12}>
                        <span className={`${c}-close`} onClick={handleClickClose}>✖</span>
                    </Col>
                    <Col md={9} className={`${c}-select-col-left`}>
                        <DatasetContainer 
                            datasets={datasets}
                            dispatch={dispatch}
                            handleDatasetSelect={handleDatasetSelect}
                            handleDatasetRequest={this.handleDatasetRequest}
                            selected={datasets.selected}
                        />
                    </Col>
                    <Col md={3} className={`${c}-select-col-right`}>
                        {showDates &&   [
                        dates.map((d: DateBoundary) => {
                            return (
                                <div 
                                    key={d.display} 
                                    className={this.setDateOptionClass(d)}
                                    onClick={this.handleDateOptionClick.bind(null, d)}
                                    tabIndex={0}>
                                    {d.display}
                                </div>
                            );
                        }),
                        <div onClick={handleByEncounterSelect} className='by-encounter'>Only Certain Encounters</div>
                        ]}
                        {!showDates &&
                        <div>This dataset cannot be filtered by dates</div>}
                    </Col>
                </Row>
                <div className={`${c}-select-footer`}>
                    <Button 
                        className="leaf-button leaf-button-primary" 
                        disabled={datasets.displayOrder.size === 0}
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
        const { datasets, selectedDates, dispatch, handleDatasetSelect } = this.props;

        if (datasets.selected) {
            const ds = datasets.all.get(datasets.selected)!;
            dispatch(getPatientListDataset(ds, selectedDates));
            handleDatasetSelect(ds);
        }
    }
}
