/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import moment from 'moment';
import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { DateBoundary, DateFilter, DateIncrementType } from '../../../models/panel/Date';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import PopupBox from '../../Other/PopupBox/PopupBox';
import { PanelHandlers } from './PanelGroup';
import 'react-day-picker/lib/style.css';
import './CustomDateRangePicker.css';

interface Props { 
    handlers: PanelHandlers;
    panel: PanelModel;
    parentDomRect: DOMRect;
    toggleCustomDateRangeBox: (show?: boolean) => any;
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

export default class CustomDateRangePicker extends React.PureComponent<Props, State> {
    private className = 'panel-custom-date-range';
    private noDateFilter: DateFilter = { dateIncrementType: DateIncrementType.NONE, increment: 0 };
    private anytime: DateBoundary = { display: 'Anytime', start: this.noDateFilter, end: this.noDateFilter };
    private dateFormat = 'YYYY-MM-DD';
    private focusPoller: any;
    
    constructor(props: Props) {
        super(props);
        this.state = {
            endDateInput: props.panel.dateFilter.end.date ? moment(props.panel.dateFilter.end.date).format(this.dateFormat) : '',
            endDateValid: true,
            startDateInput: props.panel.dateFilter.start.date ? moment(props.panel.dateFilter.start.date).format(this.dateFormat) : '',
            startDateValid: true
        }
    }

    public render() {
        const { panel, parentDomRect } = this.props;
        const { startDateValid, endDateValid, startDateInput, endDateInput } = this.state;
        const c = this.className;
        const b = `${c}-input-container`;
        const startDateClasses = `${b} ${c}-input-container-start ${startDateValid ? '' : 'invalid'}`;
        const endDateClasses = `${b} ${c}-input-container-end ${endDateValid ? '' : 'invalid'}`;

        return (
            <PopupBox
                forceMouseInOnMount={true}
                toggle={this.closeCustomDateRangeBox}
                parentDomRect={parentDomRect}>
                <div className={c}>

                    <span className={`${c}-close`} onClick={this.handleClearClick}>x</span>
                    <div className={`${c}-body`}>

                        {/* Start date */}
                        <div className={startDateClasses} id={`${c}-input-container-start${panel.index}`} onKeyDown={this.handleSearchKeydown}>
                            <DayPickerInput
                                formatDate={this.formatDate}
                                format={this.dateFormat}
                                value={startDateInput}
                                onBlur={this.closeCustomDateRangeBox}
                                onDayChange={this.handleDateChange.bind(null, DateInputType.Start)}
                                onDayPickerHide={this.pollForFocusOut}
                                dayPickerProps={{ selectedDays: panel.dateFilter.start.date }}
                                placeholder={this.dateFormat}
                            />
                        </div>

                        <span>to</span>

                        {/* End date */}
                        <div className={endDateClasses} id={`${c}-input-container-end${panel.index}`} onKeyDown={this.handleSearchKeydown}>
                            <DayPickerInput
                                format={this.dateFormat}
                                value={endDateInput}
                                onBlur={this.closeCustomDateRangeBox}
                                onDayPickerHide={this.pollForFocusOut}
                                onDayChange={this.handleDateChange.bind(null, DateInputType.End)}
                                dayPickerProps={{ selectedDays: panel.dateFilter.end.date }}
                                placeholder={this.dateFormat}
                            />
                        </div>

                    </div>
                </div>
            </PopupBox>
        );
    }

    /*
     * Not ideal, but the date picker doesn't properly fire onBlur()
     * events after a calendar date is selected, so poll for DOM focus
     * changes 4x a second to see if focus has been lost. If it's changed,
     * hide the element.
     */
    private pollForFocusOut = () => {
        if (this.focusPoller) {
            clearTimeout(this.focusPoller);
        }

        this.focusPoller = setTimeout(() =>  {
            const active = document.activeElement;
            if (active) {
                const picker = document.querySelector('.DayPickerInput-Overlay');
                if (!picker && active.tagName === 'BODY') {
                    this.closeCustomDateRangeBox();
                } else {
                    this.pollForFocusOut();
                }
            }
        }, 300)
    }

    /*
     * Updates the store with a DateBoundary object based on current input.
     */
    private setDateBoundary = (startDate: DateFilter, endDate: DateFilter) => {
        const { panel, handlers } = this.props;
        const dateBoundary: DateBoundary = {
            display: `${startDate.date!.toLocaleDateString()} - ${endDate.date!.toLocaleDateString()}`,
            end: { date: endDate.date, dateIncrementType: DateIncrementType.SPECIFIC },
            start: { date: startDate.date, dateIncrementType: DateIncrementType.SPECIFIC }
        };
        handlers.handlePanelDateFilter(panel.index, dateBoundary);
    }

    /*
     * Determines whether the current input is a valid date.
     */
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
            isValid = momentDate.isValid() && momentDate.year() > 1990 && split.length === 3 && split[2].length === 4 ? true : false;
        }
        return { date, isValid };
    }

    /*
     * Handles changes to inputs.
     */
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

    /*
     * Handles changes to the end date.
     */
    private handleEndDateChange = (updateDate: boolean, date: Date, dateInputString: string) => {
        const { panel, handlers } = this.props;
        const { startDateInput } = this.state;

        if (updateDate && date) {
            let startDate: Date = panel.dateFilter.start.date!;

            if (!startDate) {
                const momentDate = moment(startDateInput);
                startDate = momentDate.isValid() ? momentDate.toDate() : moment(date).add(-1, 'd').toDate();
                this.setState({ startDateInput: moment(startDate).format(this.dateFormat) });
            }
            const startDateFilter: DateFilter = { date: startDate, dateIncrementType: DateIncrementType.SPECIFIC };
            const endDateFilter: DateFilter = { date, dateIncrementType: DateIncrementType.SPECIFIC };
            this.setDateBoundary(startDateFilter, endDateFilter);
            this.setState({ endDateValid: true });
        }
        else if (dateInputString.length > 0) {
            this.setState({ endDateValid: false });
            handlers.handlePanelDateFilter(panel.index, this.anytime);
        }
        else {
            this.setState({ startDateValid: true });
            handlers.handlePanelDateFilter(panel.index, this.anytime);
        }
    }

    /*
     * Handles changes to the start date.
     */
    private handleStartDateChange = (updateDate: boolean, date: Date, dateInputString: string) => {
        const { panel, handlers } = this.props;
        const { endDateInput } = this.state;

        if (updateDate && date) {
            let endDate: Date = panel.dateFilter.end.date!;

            if (!endDate) {
                const momentDate = moment(endDateInput);
                endDate = momentDate.isValid() ? momentDate.toDate() : moment(date).add(1, 'd').toDate();
                this.setState({ endDateInput: moment(endDate).format(this.dateFormat) });
            }
            const startDateFilter: DateFilter = { date, dateIncrementType: DateIncrementType.SPECIFIC };
            const endDateFilter: DateFilter = { date: endDate, dateIncrementType: DateIncrementType.SPECIFIC };
            this.setDateBoundary(startDateFilter, endDateFilter);
            this.setState({ startDateValid: true });
        }
        else if (dateInputString.length > 0) {
            this.setState({ startDateValid: false });
            handlers.handlePanelDateFilter(panel.index, this.anytime);
        } else {
            this.setState({ startDateValid: true });
            handlers.handlePanelDateFilter(panel.index, this.anytime);
        }
    }

    /*
     * Custom date formatter sent to the date picker.
     */
    private formatDate = (date: Date): string => moment(date).format(this.dateFormat);

    /*
     * Handles 'x' clicked if user wants to clear the date, which resets
     * the filter to 'Anytime'.
     */
    private handleClearClick = () => {
        const { panel, handlers } = this.props;
        handlers.handlePanelDateFilter(panel.index, this.anytime);
        this.closeCustomDateRangeBox();
    }

    /* 
     * Closes the range box and clears any currently running poll.
     */
    private closeCustomDateRangeBox = () => {
        const { toggleCustomDateRangeBox } = this.props;
        if (this.focusPoller) {
            clearTimeout(this.focusPoller);
        }
        toggleCustomDateRangeBox(false);
    }

    /*
     * Handle keydown, basically looking for 'Enter' presses, which
     * dismisses the modal.
     */
    private handleSearchKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        if (k.key === 'Enter') {
            this.closeCustomDateRangeBox();
        }
    }
}