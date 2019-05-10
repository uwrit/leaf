/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import AddDatasetSelectors from '../AddDatasetSelectors/AddDatasetSelectors';
import ResponderStatusSummary from '../ResponderStatus/ResponderStatusSummary';
import { NetworkResponderMap } from '../../../models/NetworkResponder';
import { NetworkCohortState } from '../../../models/state/CohortState';
import { DateBoundary, DateFilter, DateIncrementType } from '../../../models/panel/Date';
import { PatientListConfiguration } from '../../../models/patientList/Configuration';
import { DatasetsState } from '../../../models/state/GeneralUiState';
import { createPortal } from 'react-dom';
import './AddDatasetButton.css';

interface Props {
    cohortMap: Map<number, NetworkCohortState>;
    configuration: PatientListConfiguration;
    datasets: DatasetsState;
    responderMap: NetworkResponderMap;
    dispatch: any;
}

interface State {
    categoryIdx: number;
    datasetIdx: number;
    selectedDates: DateBoundary;
    showSelectorModal: boolean;
}

const none: DateFilter = { dateIncrementType: DateIncrementType.NONE };
const today: DateFilter = { dateIncrementType: DateIncrementType.NOW };
const dates: DateBoundary[] = [
    { display: 'Anytime', start: none, end: none },
    { display: 'In Past 48 Hours', start: { increment: -48, dateIncrementType: DateIncrementType.HOUR }, end: today },
    { display: 'In Past 7 Days', start: { increment: -7, dateIncrementType: DateIncrementType.DAY }, end: today },
    { display: 'In Past 30 Days', start: { increment: -30, dateIncrementType: DateIncrementType.DAY }, end: today },
    { display: 'In Past 6 Months', start: { increment: -6, dateIncrementType: DateIncrementType.MONTH }, end: today },
    { display: 'In Past 12 Months', start: { increment: -12, dateIncrementType: DateIncrementType.MONTH }, end: today },
    { display: 'In Past 2 Years', start: { increment: -2, dateIncrementType: DateIncrementType.YEAR }, end: today },
    { display: 'In Past 3 Years', start: { increment: -3, dateIncrementType: DateIncrementType.YEAR }, end: today }
];

export default class AddDatasetButton extends React.PureComponent<Props, State> {
    private className = 'patientlist-add-dataset';
    private mouseOut = false;
    constructor(props: Props) {
        super(props);
        this.state = {
            categoryIdx: 0,
            datasetIdx: 0,
            selectedDates: dates[4],
            showSelectorModal: false
        }
    }

    public componentDidUpdate(prevProps: Props, prevState: any) {
        const { showSelectorModal } = this.state;
        const { configuration } = this.props;

        // Set focus to the element body to catch blur events if clicked outside
        if (showSelectorModal && !prevState.showSelectorModal) {
            const el: any = document.getElementsByClassName(`${this.className}-select-container`);
            if (el && el[0]) {
                el[0].focus();
            }    
        }
        if (!configuration.isFetching && prevProps.configuration.isFetching) {
            this.setState({ showSelectorModal: false });
        }
    }

    public render() {
        const c = this.className;
        const { categoryIdx, datasetIdx, selectedDates, showSelectorModal } = this.state;
        const { datasets, configuration, dispatch, cohortMap, responderMap } = this.props;
        const modalClasses = [ `${c}-select-container` ];
        const overlayClasses = [ `${c}-overlay` ];

        if (showSelectorModal) {
            modalClasses.push('show');
            if (!configuration.isFetching) {
                overlayClasses.push('show');
            }
        }

        return (
            <div className={`${c}-container`}>
                {createPortal(
                    <div className={overlayClasses.join(' ')} />, 
                    document.getElementById('main-content')!
                )}
                <div className={`${c}-button`} onClick={this.handleClick}>{this.getButtonContent()}</div>
                <div 
                    className={modalClasses.join(' ')}
                    onBlur={this.handleBlur}
                    onMouseLeave={this.handleMouseLeave} 
                    onMouseEnter={this.handleMouseEnter}
                    tabIndex={0}>
                    {configuration.isFetching &&
                    <ResponderStatusSummary cohortMap={cohortMap} responderMap={responderMap} />
                    }
                    {!configuration.isFetching &&
                    <AddDatasetSelectors 
                        dates={dates}
                        dispatch={dispatch} 
                        categoryIdx={categoryIdx}
                        configuration={configuration} 
                        className={c} 
                        datasetIdx={datasetIdx}
                        datasets={datasets}
                        handleDatasetSelect={this.handleDatasetOptionClick}
                        handleDateSelect={this.handleDateOptionClick}
                        selectedDates={selectedDates}
                    />}
                </div>
            </div>
        )
    }
    
    private getButtonContent = () => {
        const c = this.className;
        const { categoryIdx, datasetIdx, showSelectorModal } = this.state;
        const { datasets, configuration } = this.props;
        const cat = datasets.available[categoryIdx];
        const ds = cat ? cat.datasets[datasetIdx] : undefined;
        let selectedName = '';

        if (ds) {
            if (ds.name.length > 30) {
                selectedName = ds.name.substring(0, 30) + '...';
            } else {
                selectedName = ds.name;
            }
        }

        if (configuration.isFetching) {
            return <div className={`${c}-button-dataset`}>Loading data...</div>;
        } else if (showSelectorModal && datasets.available.length) {
            return <div className={`${c}-button-dataset`}>+ {selectedName}</div>;
        } else {
            return <span>+ Add More Data</span>;
        }
    }

    private handleDateOptionClick = (opt: DateBoundary) => {
        this.setState({ selectedDates: opt });
    }

    private handleDatasetOptionClick = (categoryIdx: number, datasetIdx: number) => {
        this.setState({ categoryIdx, datasetIdx });
    }

    private handleClick = () => {
        this.setState({ showSelectorModal: true });
    }

    private handleBlur = () => {
        if (this.mouseOut) {
            this.setState({ showSelectorModal: false });
        }
    }

    private handleMouseEnter = () => this.mouseOut = false;

    private handleMouseLeave = () => this.mouseOut = true;
}
