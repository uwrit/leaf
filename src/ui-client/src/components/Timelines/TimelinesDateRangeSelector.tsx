/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupButtonDropdown } from 'reactstrap';
import { DateDisplayMode, DateIncrementType, TimelinesConfiguration } from '../../models/timelines/Configuration';
import { setTimelinesConfiguration, getLatestTimelinesDataFromConfig } from '../../actions/cohort/timelines';
import './TimelinesDateRangeSelector.css';

interface Props {
    config: TimelinesConfiguration;
    dispatch: any;
}

interface State { 
    incrementTypeDropdownOpen: boolean;
    modeDropdownOpen: boolean;
}

const dateModes = [ DateDisplayMode.BEFORE_AND_AFTER, DateDisplayMode.BEFORE, DateDisplayMode.AFTER ];
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
        const { increment, incrementType, mode }  = this.props.config.dateIncrement;

        return (
            <div>
                <InputGroup>

                    {/* Before, After, Before+After */}
                    <InputGroupButtonDropdown 
                        addonType="append" 
                        isOpen={modeDropdownOpen} 
                        toggle={this.toggleDateDisplayModeDropdown}>
                        <DropdownToggle 
                            caret={true} 
                            className={`${c}-mode`}>
                            {this.getDateDisplayModeText(mode)}
                        </DropdownToggle>
                        <DropdownMenu>

                            {/* Date modes */}
                            {dateModes.map((m) => {
                                const classed = `leaf-dropdown-item ${m === mode ? 'selected' : ''}`;
                                return (
                                    <DropdownItem
                                        className={classed} 
                                        key={m}
                                        onMouseUp={this.handleDateDisplayModeChange.bind(null, m)}>
                                        {this.getDateDisplayModeText(m)}
                                    </DropdownItem>
                            )})}

                        </DropdownMenu>
                    </InputGroupButtonDropdown>

                    {/* Increment */}
                    <Input
                        className={`${c}-number leaf-input`} 
                        pattern={'0-9+'}
                        onChange={this.handleInputChange}
                        placeholder="1, 2, 3..." 
                        value={isNaN(increment) ? '' : increment} 
                    />

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

    private getDateDisplayModeText = (mode: DateDisplayMode): string => {
        switch (mode) {
            case DateDisplayMode.BEFORE: return 'Before Index Event';
            case DateDisplayMode.AFTER: return 'After Index Event';
            case DateDisplayMode.BEFORE_AND_AFTER: return 'Before / After Index Event';
        }
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

    private handleDateDisplayModeChange = (mode: DateDisplayMode) => {
        const { dispatch, config } = this.props;
        const newDateConfig = Object.assign({}, config.dateIncrement, { mode });
        const newConfig = Object.assign({}, config, { dateIncrement: newDateConfig });
        dispatch(setTimelinesConfiguration(newConfig))
        dispatch(getLatestTimelinesDataFromConfig(newConfig));
    }

    private handleDateIncrementTypeChange = (incrementType: DateIncrementType) => {
        const { dispatch, config } = this.props;
        const newDateConfig = Object.assign({}, config.dateIncrement, { incrementType });
        const newConfig = Object.assign({}, config, { dateIncrement: newDateConfig });
        dispatch(setTimelinesConfiguration(newConfig))
        dispatch(getLatestTimelinesDataFromConfig(newConfig));
    }

    private handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const increment = parseInt(e.currentTarget.value);
        const { dispatch, config } = this.props;
        const newDateConfig = Object.assign({}, config.dateIncrement, { increment });
        const newConfig = Object.assign({}, config, { dateIncrement: newDateConfig });
        dispatch(setTimelinesConfiguration(newConfig))
        dispatch(getLatestTimelinesDataFromConfig(newConfig));
    }

    private toggleIncrementTypeDropdown = () => {
        this.setState({ incrementTypeDropdownOpen: !this.state.incrementTypeDropdownOpen });
    }

    private toggleDateDisplayModeDropdown = () => {
        this.setState({ modeDropdownOpen: !this.state.modeDropdownOpen });
    }
}
