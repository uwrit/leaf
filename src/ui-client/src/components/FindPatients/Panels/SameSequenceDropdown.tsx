/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from 'reactstrap';
import { setSubPanelJoinSequence } from '../../../actions/panels';
import { DateIncrementType } from '../../../models/panel/Date';
import { SubPanel as SubPanelModel, SequenceType } from '../../../models/panel/SubPanel';
import SameSequenceDropdownIncrement from './SameSequenceDropdownIncrement';

interface Props {
    dispatch: any
    index: number,
    SubPanel: SubPanelModel,
}

interface State {
    dropdownOpen: boolean;
    withinPlusMinusInput: string;
    withinFollowingInput: string;
}

interface NullableSubPanelJoinSequence {
    dateIncrementType?: DateIncrementType;
    increment?: number;
    sequenceType?: SequenceType; 
}

const joinSequenceTypes = new Map([
    [ SequenceType.Encounter, { display: 'In the Same Encounter', type: SequenceType.Encounter }],
    [ SequenceType.Event, { display: 'In the Same Event', type: SequenceType.Event }],
    [ SequenceType.PlusMinus, { display: 'Within +/-', type: SequenceType.PlusMinus }],
    [ SequenceType.WithinFollowing, { display: 'In the Following', type: SequenceType.WithinFollowing }],
    [ SequenceType.AnytimeFollowing, { display: 'Anytime After', type: SequenceType.AnytimeFollowing }]
]);
const encounterText = 'In the Same Encounter';
const eventText = 'In the Same Event';
const anytimeAfterText = 'Anytime After';
const withinFollowingText = 'In the Following';
const plusMinusText = 'Within +/-';

export default class SameSequenceDropdown extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { 
            dropdownOpen: false,
            withinFollowingInput: '1',
            withinPlusMinusInput: '1'
        };
    }

    public updateStoreWithJoinSequence = (joinSequence: NullableSubPanelJoinSequence) => {
        this.props.dispatch(
            setSubPanelJoinSequence(
                this.props.SubPanel.panelIndex,
                this.props.index,
                { ...this.props.SubPanel.joinSequence, ...joinSequence }
            )
        );
    }

    public setDisplayText = () => {
        const reg = /^\w/;
        const sequence = this.props.SubPanel.joinSequence; 
        const text = [ joinSequenceTypes.get(sequence.sequenceType)!.display ];

        if (sequence.sequenceType === SequenceType.PlusMinus || 
            sequence.sequenceType === SequenceType.WithinFollowing 
        ) {
            text.push(`${sequence.increment} 
                ${DateIncrementType[sequence.dateIncrementType]
                    .toString()
                    .toLowerCase()
                    .replace(reg, (c: string) => c.toUpperCase())}${sequence.increment === 1 ? '' : 's'}`);
        }
        return text.join(' ');
    }
    
    public toggleDropdown = () => {
        this.setState((prevState: any) => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    public handleWithinPlusMinusInputChange = (e: any) => {
        const text: string = e.target.value;
        if (this.isValidNumericInput(text)) {
            this.setState({ withinPlusMinusInput: text });
            this.updateStoreWithJoinSequence({ increment: +text, sequenceType: SequenceType.PlusMinus });
        }
    }

    public handleWithinFollowingInputChange = (e: any) => {
        const text: string = e.target.value;
        if (this.isValidNumericInput(text)) {
            this.setState({ withinFollowingInput: text });
            this.updateStoreWithJoinSequence({ increment: +text, sequenceType: SequenceType.WithinFollowing });
        }
    }

    public handleDropdownSelect = (e: any) => {
        const text: string = e.target.innerText;
        switch (text) {
            case encounterText:
                this.updateStoreWithJoinSequence({ sequenceType: SequenceType.Encounter });
                return;
            case eventText:
                this.updateStoreWithJoinSequence({ sequenceType: SequenceType.Event });
                return;
            case anytimeAfterText:
                this.updateStoreWithJoinSequence({ sequenceType: SequenceType.AnytimeFollowing });
                return;
        }
        if (text.indexOf(plusMinusText) > -1) {
            this.updateStoreWithJoinSequence({ increment: +this.state.withinPlusMinusInput, sequenceType: SequenceType.PlusMinus });
            this.setState({ dropdownOpen: false });
        }
        else if (text.indexOf(withinFollowingText) > -1) {
            this.updateStoreWithJoinSequence({ increment: +this.state.withinFollowingInput, sequenceType: SequenceType.WithinFollowing });
            this.setState({ dropdownOpen: false });
        }
    }

    public handleWithinPlusMinusDropdownIncrementSelect = (dateTypeString: any) => {
        this.updateStoreWithJoinSequence({ 
            dateIncrementType: DateIncrementType[dateTypeString] as any, 
            increment: +this.state.withinPlusMinusInput, 
            sequenceType: SequenceType.PlusMinus 
        });
    }

    public handleWithinFollowingDropdownIncrementSelect = (dateTypeString: any) => {
        this.updateStoreWithJoinSequence({ 
            dateIncrementType: DateIncrementType[dateTypeString] as any, 
            increment: +this.state.withinFollowingInput, 
            sequenceType: SequenceType.WithinFollowing 
        });
    }

    public handleClickPreventDefault = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
    }

    public isValidNumericInput = (val: string, allowEmpty: boolean = true): boolean => {
        const value = val.trim();
        if (isNaN(+value) || value.indexOf('.') > -1)           { return false; }
        else if (value.indexOf('0') !== value.lastIndexOf('0')) { return false; }
        else if (!allowEmpty && val.length === 0)               { return false; }
        return true;
    }

    public addSelectedClassIfMatched = (classes: string, sequenceType: SequenceType) => {
        return `${classes} ${sequenceType === this.props.SubPanel.joinSequence.sequenceType ? 'selected' : ''}`;
    }

    public render() {
        const displayText = this.setDisplayText();
        const currentIncrement = DateIncrementType[this.props.SubPanel.joinSequence.dateIncrementType].toString();
        const encounterClasses = this.addSelectedClassIfMatched('leaf-dropdown-item', SequenceType.Encounter);
        const eventClasses = this.addSelectedClassIfMatched('leaf-dropdown-item', SequenceType.Event);
        const plusMinusClasses = this.addSelectedClassIfMatched('leaf-dropdown-item same-sequence-dropdown-input arrow-right', SequenceType.PlusMinus);
        const withinFollowingClasses = this.addSelectedClassIfMatched('leaf-dropdown-item same-sequence-dropdown-input arrow-right', SequenceType.WithinFollowing);
        const anytimeAfterClasses = this.addSelectedClassIfMatched('leaf-dropdown-item', SequenceType.AnytimeFollowing);

        return (
            <Dropdown 
                className="panel-header-samesequence"
                isOpen={this.state.dropdownOpen} 
                toggle={this.toggleDropdown}>
                <DropdownToggle caret={true}>
                    {displayText}
                </DropdownToggle>
                <DropdownMenu className="leaf-dropdown-menu">
                    <DropdownItem 
                        className={encounterClasses}
                        onClick={this.handleDropdownSelect}>
                        {encounterText}
                    </DropdownItem>
                    <DropdownItem 
                        className={eventClasses}
                        onClick={this.handleDropdownSelect}>
                        {eventText}
                    </DropdownItem>
                    <div 
                        className={plusMinusClasses}
                        onClick={this.handleDropdownSelect}>
                        {plusMinusText}
                        <Input 
                            className="same-sequence-input leaf-input" 
                            onChange={this.handleWithinPlusMinusInputChange}
                            placeholder="1, 2, 3..."
                            value={this.state.withinPlusMinusInput}
                            />
                        <SameSequenceDropdownIncrement 
                            currentIncrement={currentIncrement} 
                            onClickFunc={this.handleWithinPlusMinusDropdownIncrementSelect} />
                    </div>
                    <div 
                        className={withinFollowingClasses}
                        onClick={this.handleDropdownSelect}>
                        {withinFollowingText}
                        <Input 
                            className="same-sequence-input leaf-input" 
                            onChange={this.handleWithinFollowingInputChange}
                            placeholder="1, 2, 3..."
                            value={this.state.withinFollowingInput}
                            />
                        <SameSequenceDropdownIncrement 
                            currentIncrement={currentIncrement} 
                            onClickFunc={this.handleWithinFollowingDropdownIncrementSelect} />    
                    </div>
                    <DropdownItem 
                        className={anytimeAfterClasses}
                        onClick={this.handleDropdownSelect}>
                        {anytimeAfterText}
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        );
    }
}
