/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import { futureDates, none, pastDates } from './DateDropdownOptions';
import { DateBoundary, DateIncrementType } from '../../../models/panel/Date';
import { PanelHandlers } from './PanelGroup';

interface State {
    dropdownOpen: boolean;
}

interface Props {
    handlers: PanelHandlers;
    handleCustomDateClick: (e: any) => void;
    panel: PanelModel;
}

export default class DateDropdown extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { dropdownOpen: false };
    }

    public render() {
        const { handleCustomDateClick, panel } = this.props;
        const { dropdownOpen } = this.state;
        const { dateFilter } = panel;
        const customDateFilterClasses = `leaf-dropdown-item ${dateFilter.start.dateIncrementType === DateIncrementType.SPECIFIC ? 'selected' : ''}`;
        const anytimeDateFilterClasses = `leaf-dropdown-item ${dateFilter.start.dateIncrementType === DateIncrementType.NONE ? 'selected' : ''}`;
        const anytime: DateBoundary = { start: none, end: none };

        return (
            <Dropdown isOpen={dropdownOpen} toggle={this.toggle} className="panel-header-date">
                <DropdownToggle caret={true}>
                    {this.getDateDisplay(dateFilter)}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem className={anytimeDateFilterClasses} onClick={this.handleClick.bind(null, anytime)}>Anytime</DropdownItem>
                    <DropdownItem divider={true} />
                    <DropdownItem className={customDateFilterClasses} onClick={handleCustomDateClick}>Custom Date Range</DropdownItem>
                    <DropdownItem divider={true} />
                    {pastDates.map((opt: DateBoundary) => (
                        <DropdownItem className={this.setDropdownItemClasses(opt)} key={opt.display} onClick={this.handleClick.bind(null, opt)}>{opt.display}</DropdownItem>
                    ))}
                    <DropdownItem divider={true} />
                    {futureDates.map((opt: DateBoundary) => (
                        <DropdownItem className={this.setDropdownItemClasses(opt)} key={opt.display} onClick={this.handleClick.bind(null, opt)}>{opt.display}</DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        );
    }

    private toggle = () => {
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    }

    private handleClick = (dateFilter: DateBoundary) => {
        const { handlers, panel } = this.props;
        handlers.handlePanelDateFilter(panel.index, dateFilter);
    }

    private setDropdownItemClasses = (dates: DateBoundary) => {
        const { dateFilter } = this.props.panel;
        return `leaf-dropdown-item ${
            dates.start.dateIncrementType === dateFilter.start.dateIncrementType &&
            dates.start.increment! === dateFilter.start.increment! &&
            dates.end.dateIncrementType === dateFilter.end.dateIncrementType &&
            dates.end.increment! === dateFilter.end.increment!
            ? 'selected' : ''
        }`;
    }

    private getDateDisplay = (filter: DateBoundary): string => {
        const { start, end } = filter;
    
        if (start.dateIncrementType === DateIncrementType.NONE && end.dateIncrementType === DateIncrementType.NONE) {
            return "Anytime";
        } else if (end.dateIncrementType === DateIncrementType.NOW && start.increment) {
            return `In Past ${Math.abs(start.increment)} ${this.dateIncrementEnumToString(start.dateIncrementType)}`;
        } else if (start.dateIncrementType === DateIncrementType.NOW && end.increment) {
            return `In Next ${end.increment} ${this.dateIncrementEnumToString(end.dateIncrementType)}`;
        } else if (start.dateIncrementType === DateIncrementType.SPECIFIC && end.dateIncrementType === DateIncrementType.SPECIFIC) {
            return `${start.date!.toLocaleDateString()} - ${end.date!.toLocaleDateString()}`;
        }
        return "";
    };
    
    private dateIncrementEnumToString = (increment: DateIncrementType) => {
        switch(increment) {
            case DateIncrementType.MINUTE: return "Minutes";
            case DateIncrementType.HOUR: return "Hours";
            case DateIncrementType.DAY: return "Days";
            case DateIncrementType.MONTH: return "Months";
            case DateIncrementType.YEAR: return "Years";
            default: return "";
        };
    };
}

