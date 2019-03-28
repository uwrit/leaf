/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import moment from 'moment';
import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { Button } from 'reactstrap';
import { setPanelDateFilter } from '../../../actions/panels';
import { DateBoundary, DateFilter, DateIncrementType } from '../../../models/panel/Date';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import PopupBox from '../../Other/PopupBox/PopupBox';
import { showInfoModal } from '../../../actions/generalUi';
import { InformationModalState } from '../../../models/state/GeneralUiState';
import 'react-day-picker/lib/style.css';
import './CustomDateRangePicker.css';

interface Props { 
    dispatch: any;
    panel: PanelModel;
    parentDomRect: DOMRect;
    toggleCustomDateRangeBox: any;
}

interface State { 
    startDateInput: string;
    startDateValid: boolean;
    endDateValid: boolean;
    endDateInput: string;
}

enum DateInputType {
    Start = 1,
    End = 2
}

const c = 'panel-custom-date-range'
const noDateFilter: DateFilter = { dateIncrementType: DateIncrementType.NONE, increment: 0 }
const anytime: DateBoundary = { display: 'Anytime', start: noDateFilter, end: noDateFilter };
const dateFormat = 'YYYY-MM-DD';

export default class CustomDateRangePicker extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            endDateInput: this.props.panel.dateFilter.end.date ? moment(this.props.panel.dateFilter.end.date).format(dateFormat) : '',
            endDateValid: true,
            startDateInput: this.props.panel.dateFilter.start.date ? moment(this.props.panel.dateFilter.start.date).format(dateFormat) : '',
            startDateValid: true
        }
    }

    public render() {
        const panelIndex = this.props.panel.index;
        const baseDateClass = `${c}-input-container`;
        const startDateClasses = `${baseDateClass} ${c}-input-container-start${panelIndex} ${this.state.startDateValid ? '' : 'invalid'}`;
        const endDateClasses = `${baseDateClass} ${c}-input-container-end${panelIndex} ${this.state.endDateValid ? '' : 'invalid'}`;

        return (
            <PopupBox 
                forceMouseInOnMount={true}
                toggle={this.handleClickOutsidePopupBox}
                parentDomRect={this.props.parentDomRect}>
                <div className={`${c}`}>
                    <div className={`${c}-title`}>Set Custom Date Range </div>
                    <div className={`${c}-body`}>
                        <div className={startDateClasses}>
                            <DayPickerInput
                                formatDate={this.formatDate}
                                format={dateFormat}
                                value={this.state.startDateInput}
                                onDayChange={this.handleDateChange.bind(null, DateInputType.Start)}
                                dayPickerProps={{ selectedDays: this.props.panel.dateFilter.start.date }}
                                placeholder={dateFormat}
                            />
                        </div>
                        <span>to</span>
                        <div className={endDateClasses}>
                            <DayPickerInput
                                format={dateFormat}
                                value={this.state.endDateInput}
                                onDayChange={this.handleDateChange.bind(null, DateInputType.End)}
                                dayPickerProps={{ selectedDays: this.props.panel.dateFilter.end.date }}
                                placeholder={dateFormat}
                            />
                        </div>
                    </div>
                    <div className={`${c}-footer`}>
                        <Button className="leaf-button leaf-button-secondary" onClick={this.handleClearClick} >Clear</Button>
                        <Button className="leaf-button leaf-button-primary" onClick={this.handleAddDatesClick} style={{ float: 'right' }}>Add Dates</Button>
                    </div>
            </div>
          </PopupBox>
        );
    }

    private setDateBoundary = (startDate: DateFilter, endDate: DateFilter) => {
        const panelIndex = this.props.panel.index;
        const dateBoundary: DateBoundary = {
            display: `${startDate.date!.toLocaleDateString()} - ${endDate.date!.toLocaleDateString()}`,
            end: { date: endDate.date, dateIncrementType: DateIncrementType.SPECIFIC },
            start: { date: startDate.date, dateIncrementType: DateIncrementType.SPECIFIC }
        };
        this.props.dispatch(setPanelDateFilter(panelIndex, dateBoundary));
    }

    private validateDateString = (input: string) => {
        let isValid = false;
        const date = new Date(input);
        const splitter = 
            input.indexOf('/') > -1 ? '/' : 
            input.indexOf('-') > -1 ? '-' :
            input.indexOf('.') > -1 ? '.' : '';
        const split = input.split(splitter).filter((s: string) => s !== '');

        if (!splitter) {
            return { date, isValid: false };
        }
        if (date) {
            const momentDate = moment(date);
            isValid = momentDate.isValid && momentDate.year() > 1990 && split.length === 3 && split[2].length === 4 ? true : false;
        }
        return { date, isValid };
    }

    private handleDateChange = (type: DateInputType, selectedDay: Date, modifiers: any, dayPickerInput: any) => {
        const input: string = dayPickerInput.input.value;
        let updateDate = true;

        // If the selected date was not valid
        if (!selectedDay) {
            const { date, isValid } = this.validateDateString(input);
            selectedDay = date;
            updateDate = isValid;
        }
        if (type === DateInputType.Start) {
            this.handleStartDateChange(updateDate, selectedDay, input);
            this.setState({ startDateInput: input });
        }
        else { 
            this.handleEndDateChange(updateDate, selectedDay, input);
            this.setState({ endDateInput: input });
        }
    }

    private handleEndDateChange = (updateDate: boolean, date: Date, dateInputString: string) => {
        if (updateDate && date) {
            let startDate: Date = this.props.panel.dateFilter.start.date!;

            if (!startDate) {
                const momentDate = moment(this.state.startDateInput);
                startDate = momentDate.isValid() ? momentDate.toDate() : moment(date).add(-1, 'd').toDate();
                this.setState({ startDateInput: moment(startDate).format(dateFormat) });
            }
            const startDateFilter: DateFilter = { date: startDate, dateIncrementType: DateIncrementType.SPECIFIC };
            const endDateFilter: DateFilter = { date, dateIncrementType: DateIncrementType.SPECIFIC };
            this.setDateBoundary(startDateFilter, endDateFilter);
            this.setState({ endDateValid: true });
        }
        else if (dateInputString.length > 0) {
            this.setState({ endDateValid: false });
            this.props.dispatch(setPanelDateFilter(this.props.panel.index, anytime));
        }
        else {
            this.setState({ startDateValid: true });
            this.props.dispatch(setPanelDateFilter(this.props.panel.index, anytime));
        }
    }

    private handleStartDateChange = (updateDate: boolean, date: Date, dateInputString: string) => {
        if (updateDate && date) {
            let endDate: Date = this.props.panel.dateFilter.end.date!;

            if (!endDate) {
                const momentDate = moment(this.state.endDateInput);
                endDate = momentDate.isValid() ? momentDate.toDate() : moment(date).add(1, 'd').toDate();
                this.setState({ endDateInput: moment(endDate).format(dateFormat) });
            }
            const startDateFilter: DateFilter = { date, dateIncrementType: DateIncrementType.SPECIFIC };
            const endDateFilter: DateFilter = { date: endDate, dateIncrementType: DateIncrementType.SPECIFIC };
            this.setDateBoundary(startDateFilter, endDateFilter);
            this.setState({ startDateValid: true });
        }
        else if (dateInputString.length > 0) {
            this.setState({ startDateValid: false });
            this.props.dispatch(setPanelDateFilter(this.props.panel.index, anytime));
        }
        else {
            this.setState({ startDateValid: true });
            this.props.dispatch(setPanelDateFilter(this.props.panel.index, anytime));
        }
    }

    private formatDate = (date: Date): string => moment(date).format(dateFormat);

    private handleClickOutsidePopupBox = () => this.props.toggleCustomDateRangeBox(true);

    private handleClearClick = () => {
        this.props.dispatch(setPanelDateFilter(this.props.panel.index, anytime));
        this.props.toggleCustomDateRangeBox();
    }

    private handleAddDatesClick = () => {
        const { endDateValid, endDateInput, startDateInput, startDateValid } = this.state;
        if (endDateValid && startDateValid && endDateInput.length && startDateInput.length) {
            this.props.toggleCustomDateRangeBox();
        }
        else {
            const { dispatch } = this.props;
            const info: InformationModalState = {
                body: 'Make sure dates are correctly formatted (MM/DD/YYYY) and the end date follows the start date',
                header: 'Date formatting error',
                show: true
            };
            dispatch(showInfoModal(info));
        }
    }
}
