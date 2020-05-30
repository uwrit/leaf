/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
import EncounterPanelSelector from './EncounterPanelSelector';

interface Props {
    className?: string;
    configuration: PatientListConfiguration;
    dates: DateBoundary[];
    datasets: DatasetsState;
    dispatch: any;
    handleClickClose: () => void;
    handleDatasetSelect: (dataset: PatientListDatasetQuery) => void;
    handleEncounterPanelSelect: (panelIndex: number | undefined) => void;
    handleDateSelect: (date: DateBoundary) => void;
    selectedDates?: DateBoundary;
    selectedEncounterPanel?: number;
    showDates: boolean;
}

interface State {
    showEncounterPanelModal: boolean;
}

export default class AddDatasetSelectors extends React.PureComponent<Props,State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            showEncounterPanelModal: false
        }
    }

    public render() {
        const { datasets, className, dates, dispatch, handleDatasetSelect, handleClickClose, showDates, selectedEncounterPanel } = this.props;
        const { showEncounterPanelModal } = this.state;
        const c = className ? className : 'patientlist-add-dataset';
        const selected = datasets.all.get(datasets.selected);

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
                        {showDates && 
                        <div>
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
                            <div className={`${c}-divider`}></div>
                            {this.getByEncounterContent(selectedEncounterPanel)}
                        </div>
                        }
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
                {showEncounterPanelModal && 
                <EncounterPanelSelector 
                    dataset={selected} 
                    handleByEncounterSelect={this.handleEncounterPanelSelect}
                    toggle={this.hideEncounterPanelModal}
                />
                }
            </div>
        )
    }

    private getByEncounterContent = (selectedEncounterPanel?: number) => {
        const { className } = this.props;

        if (typeof selectedEncounterPanel === 'undefined') {
            return <div onClick={this.showEncounterPanelModal} className={`${className}-by-encounter`}>From Specific Encounters</div>;
        }
        return <div onClick={this.showEncounterPanelModal} className={`${className}-by-encounter selected`}>From Panel {selectedEncounterPanel+1}</div>;
    }

    private handleDateOptionClick = (opt: DateBoundary) => {
        const { handleDateSelect } = this.props;
        handleDateSelect(opt);
    }

    private setDateOptionClass = (date: DateBoundary) => {
        const { className, selectedDates } = this.props;
        return `${className}-select-date-option ${date === selectedDates ? 'selected' : ''}`
    }

    private showEncounterPanelModal = () => this.setState({ showEncounterPanelModal: true });

    private hideEncounterPanelModal = () => this.setState({ showEncounterPanelModal: false });

    private handleEncounterPanelSelect = (panelIndex: number | undefined) => {
        const { handleEncounterPanelSelect } = this.props;

        this.setState({ showEncounterPanelModal: false })
        handleEncounterPanelSelect(panelIndex);
    }

    private handleDatasetRequest = () => {
        const { datasets, selectedDates, selectedEncounterPanel, dispatch, handleDatasetSelect } = this.props;

        if (datasets.selected) {
            const ds = datasets.all.get(datasets.selected)!;
            dispatch(getPatientListDataset(ds, selectedDates, selectedEncounterPanel));
            handleDatasetSelect(ds);
        }
    }
}
