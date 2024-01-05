/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
import { createPortal } from 'react-dom';
import { DatasetsState } from '../../../models/state/AppState';
import { setDatasetSelected } from '../../../actions/datasets';
import { PatientListDatasetQuery } from '../../../models/patientList/Dataset';
import './AddDatasetButton.css';

interface Props {
    cohortMap: Map<number, NetworkCohortState>;
    configuration: PatientListConfiguration;
    datasets: DatasetsState;
    responderMap: NetworkResponderMap;
    dispatch: any;
}

interface State {
    selectedEncounterPanel?: number; 
    selectedDates?: DateBoundary;
    showDates: boolean;
    showSelectorModal: boolean;
}

const none: DateFilter = { dateIncrementType: DateIncrementType.NONE };
const today: DateFilter = { dateIncrementType: DateIncrementType.NOW };
const dates: DateBoundary[] = [
    { display: 'Anytime', start: none, end: none },
    { display: 'Custom Date Range', start: { dateIncrementType: DateIncrementType.SPECIFIC}, end: { dateIncrementType: DateIncrementType.SPECIFIC} },
    { display: 'In Past 48 Hours',  abbrev: '48H', start: { increment: -48, dateIncrementType: DateIncrementType.HOUR }, end: today },
    { display: 'In Past 7 Days',    abbrev: '7D',  start: { increment: -7,  dateIncrementType: DateIncrementType.DAY }, end: today },
    { display: 'In Past 30 Days',   abbrev: '30D', start: { increment: -30, dateIncrementType: DateIncrementType.DAY }, end: today },
    { display: 'In Past 6 Months',  abbrev: '6M',  start: { increment: -6,  dateIncrementType: DateIncrementType.MONTH }, end: today },
    { display: 'In Past 12 Months', abbrev: '12M', start: { increment: -12, dateIncrementType: DateIncrementType.MONTH }, end: today },
    { display: 'In Past 2 Years',   abbrev: '2Y',  start: { increment: -2,  dateIncrementType: DateIncrementType.YEAR }, end: today },
    { display: 'In Past 3 Years',   abbrev: '3Y',  start: { increment: -3,  dateIncrementType: DateIncrementType.YEAR }, end: today }
];

export default class AddDatasetButton extends React.PureComponent<Props, State> {
    private className = 'patientlist-add-dataset';
    private mouseOut = true;
    constructor(props: Props) {
        super(props);
        this.state = {
            selectedDates: dates[0],
            showDates: false,
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
        const { selectedDates, selectedEncounterPanel, showSelectorModal, showDates } = this.state;
        const { datasets, configuration, dispatch, cohortMap, responderMap } = this.props;
        const modalClasses = [ `${c}-select-container` ];
        const overlayClasses = [ `${c}-overlay` ];

        if (showSelectorModal) {
            modalClasses.push('show');
            if (!configuration.isFetching) {
                overlayClasses.push('show');
            }
        }
        
        /**
         * Create array of React components.
         */
        const arr = [
            createPortal(
                <div className={overlayClasses.join(' ')} key={1}/>, 
                document.getElementById('main-content')!
            ),
            <div className={`${c}-button`} onClick={this.handleClick} key={2}>{this.getButtonContent()}</div>
        ];
        
        /**
         * Display the site summary if fetching a dataset.
         */
        if (configuration.isFetching) {
            arr.push(
                <div className={`${c}-status-container`} key={3}>
                    <ResponderStatusSummary cohortMap={cohortMap} responderMap={responderMap} />
                </div>
            )
        /**
         * Show the selector modal.
         */
        } else if (showSelectorModal) {
            arr.push(
                <div 
                    className={modalClasses.join(' ')}
                    onBlur={this.handleBlur} 
                    onMouseLeave={this.handleMouseLeave} 
                    onMouseEnter={this.handleMouseEnter} 
                    tabIndex={0} 
                    key={4}>
                    <AddDatasetSelectors 
                        dates={dates}
                        dispatch={dispatch} 
                        configuration={configuration} 
                        className={c}
                        datasets={datasets}
                        handleClickClose={this.handleClickClose}
                        handleEncounterPanelSelect={this.handleEncounterPanelSelect}
                        handleDatasetSelect={this.handleDatasetOptionClick}
                        handleDateSelect={this.handleDateOptionClick}
                        selectedDates={selectedDates}
                        selectedEncounterPanel={selectedEncounterPanel}
                        showDates={showDates}
                    />
                </div>
            );
        }

        return arr;
    }
    
    private getButtonContent = () => {
        const c = this.className;
        const { showSelectorModal } = this.state;
        const { datasets, configuration } = this.props;
        const selected = datasets.all.get(datasets.selected);
        let selectedName = '';

        if (selected) {
            selectedName = selected.name.length > 20
                ? selected.name.substring(0, 20) + '...'
                : selected.name;
        }

        if (configuration.isFetching) {
            return <div className={`${c}-button-dataset`}>Loading data...</div>;
        } else if (showSelectorModal && datasets.display.size && datasets.selected) {
            return <div className={`${c}-button-dataset`}>+ {selectedName}</div>;
        } else {
            return <span>+ Add More Data</span>;
        }
    }

    private handleDateOptionClick = (opt: DateBoundary) => {
        const customIdx = dates.findIndex(d => d.start.dateIncrementType === DateIncrementType.SPECIFIC);

        if (opt.start.dateIncrementType === DateIncrementType.SPECIFIC) {
            dates[customIdx] = opt;
        } else {
            dates[customIdx].display = 'Custom Date Range';
        }
        this.setState({ selectedDates: opt, selectedEncounterPanel: undefined });
    }

    private handleEncounterPanelSelect = (selectedEncounterPanel: number | undefined ) => {
        const selectedDates = typeof selectedEncounterPanel === 'undefined' ? dates[4] : undefined;
        this.setState({ selectedEncounterPanel, selectedDates });
    }

    private handleDatasetOptionClick = (dataset: PatientListDatasetQuery) => {
        const { dispatch } = this.props;
        this.setState({ showDates: dataset.isEncounterBased });
        dispatch(setDatasetSelected(dataset));
    }

    private handleClick = () => {
        this.setState({ showSelectorModal: true });
    }

    private handleClickClose = () => {
        this.setState({ showSelectorModal: false });
    }

    private handleBlur = () => {
        const { isFetching } = this.props.configuration;
        return;

        if (this.mouseOut && !isFetching) {
            this.setState({ showSelectorModal: false });
        }
    }

    private handleMouseEnter = () => this.mouseOut = false;

    private handleMouseLeave = () => this.mouseOut = true;
}
