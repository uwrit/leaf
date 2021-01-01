/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupButtonDropdown } from 'reactstrap';
import { TimelinesDateConfiguration, DateIncrementType } from '../../models/timelines/Configuration';
import { setTimelinesConfigurationDates } from '../../actions/cohort/timelines';
import './TimelinesDateRangeSelector.css';

interface Props {
    config: TimelinesDateConfiguration;
    dispatch: any;
}

interface State { 
    incrementTypeDropdownOpen: boolean;
    modeDropdownOpen: boolean;
}

const dateTypes = [ DateIncrementType.MINUTE, DateIncrementType.HOUR, DateIncrementType.DAY,
                    DateIncrementType.WEEK, DateIncrementType.MONTH, DateIncrementType.YEAR ];

export default class TimelinesDateRangeSelector extends React.Component<Props, State> {
    private className = 'timelines-date-range-selector';

    constructor(props: Props) {
        super(props);
        this.state = {
            incrementTypeDropdownOpen: false,
            modeDropdownOpen: false
        }
    }

    public render() {
        const c = this.className;
        const { incrementTypeDropdownOpen, modeDropdownOpen } = this.state;
        const { increment, incrementType, mode }  = this.props.config;

        return (
            <div>
                <InputGroup>

                    {/* Increment */}
                    <Input
                        className={`${c}-number leaf-input`} 
                        type="number"
                        onChange={this.handleInputChange}
                        placeholder="1, 2, 3..." 
                        value={increment} />

                    {/* Increment Type */}
                    <InputGroupButtonDropdown 
                        addonType="append" 
                        isOpen={incrementTypeDropdownOpen} 
                        toggle={this.toggleIncrementTypeDropdown}>
                        <DropdownToggle 
                            caret={true} 
                            className={`${c}-type`}>
                            {this.getIncrementTypeText(incrementType)}
                        </DropdownToggle>
                        <DropdownMenu>

                            {/* Date types */}
                            {dateTypes.map((t) => {
                                const classed = `leaf-dropdown-item ${t === incrementType ? 'selected' : ''}`;
                                return (
                                    <DropdownItem
                                        className={classed} 
                                        key={t}
                                        onMouseUp={this.handleDateIncrementTypeChange.bind(null,t)}>
                                        {this.getIncrementTypeText(t)}
                                    </DropdownItem>
                            )})}

                        </DropdownMenu>
                    </InputGroupButtonDropdown>
                </InputGroup>
            </div>
        );
    }

    private getIncrementTypeText = (type: DateIncrementType): string => {
        switch (type) {
            case DateIncrementType.DAY:    return 'Days';
            case DateIncrementType.HOUR:   return 'Hours';
            case DateIncrementType.MINUTE: return 'Minutes';
            case DateIncrementType.MONTH:  return 'Months';
            case DateIncrementType.WEEK:   return 'Weeks';
            case DateIncrementType.YEAR:   return 'Years';
        }
    }

    private handleDateIncrementTypeChange = (incrementType: DateIncrementType) => {
        const { dispatch, config } = this.props;
        const newConfig = Object.assign({}, config, {
            incrementType
        });
        dispatch(setTimelinesConfigurationDates(newConfig))
    }

    private handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const increment = parseInt(e.currentTarget.value);
        const { dispatch, config } = this.props;
        const newConfig = Object.assign({}, config, {
            increment
        });
        dispatch(setTimelinesConfigurationDates(newConfig))
    }

    private toggleIncrementTypeDropdown = () => {
        this.setState({ incrementTypeDropdownOpen: !this.state.incrementTypeDropdownOpen });
    }
}
