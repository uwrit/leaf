/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from 'reactstrap';
import { setSubPanelJoinSequence } from '../../../actions/panels';
import { DateIncrementType } from '../../../models/panel/Date';
import { SubPanel as SubPanelModel, SequenceType, SubPanelJoinSequence } from '../../../models/panel/SubPanel';
import SameSequenceDropdownIncrement from './SameSequenceDropdownIncrement';

interface Props {
    dispatch: any
    index: number,
    subPanel: SubPanelModel,
}

interface State {
    dropdownOpen: boolean;
    withinPlusMinusInput: number | null;
    withinFollowingInput: number | null;
}

/*
 * Join sequence types available in UI.
 */
const joinSequenceTypes = new Map([
    [ SequenceType.Encounter, { display: 'In the Same Encounter', type: SequenceType.Encounter }],
    [ SequenceType.Event, { display: 'In the Same', type: SequenceType.Event }],
    [ SequenceType.PlusMinus, { display: 'Within +/-', type: SequenceType.PlusMinus }],
    [ SequenceType.WithinFollowing, { display: 'In the Following', type: SequenceType.WithinFollowing }],
    [ SequenceType.AnytimeFollowing, { display: 'Anytime After', type: SequenceType.AnytimeFollowing }]
]);

export default class SameSequenceDropdown extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { 
            dropdownOpen: false,
            withinFollowingInput: 1,
            withinPlusMinusInput: 1
        };
    }

    public render() {
        const { subPanel } = this.props;
        const { withinFollowingInput, withinPlusMinusInput } = this.state;
        const dateType = DateIncrementType[subPanel.joinSequence.dateIncrementType].toString();
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
                    {this.setDisplayText()}
                </DropdownToggle>
                <DropdownMenu className="leaf-dropdown-menu">

                    {/* Same Encounter */}
                    <DropdownItem 
                        className={encounterClasses}
                        onClick={this.handleDropdownSelect.bind(null, SequenceType.Encounter)}>
                        In the Same Encounter
                    </DropdownItem>

                    {/* Same Event */}
                    {subPanel.joinSequenceEventType &&
                    <DropdownItem 
                        className={eventClasses}
                        onClick={this.handleDropdownSelect.bind(null, SequenceType.Event)}>
                        In the Same {subPanel.joinSequenceEventType.name}
                    </DropdownItem>
                    }

                    {/* Within +/- */}
                    <div 
                        className={plusMinusClasses}
                        onClick={this.handleDropdownSelect.bind(null, SequenceType.PlusMinus)}>
                        Within +/-
                        <Input 
                            className="same-sequence-input leaf-input" 
                            onChange={this.handleWithinPlusMinusInputChange}
                            onClick={this.handleClickPreventDefault}
                            placeholder="1, 2, 3..."
                            value={this.storeNumericValueToString(withinPlusMinusInput)}
                        />
                        <SameSequenceDropdownIncrement
                            dateType={dateType} 
                            increment={withinPlusMinusInput}
                            onClick={this.handleWithinPlusMinusDropdownIncrementSelect} />
                    </div>

                    {/* Within the Following */}
                    <div 
                        className={withinFollowingClasses}
                        onClick={this.handleDropdownSelect.bind(null, SequenceType.WithinFollowing)}>
                        Within the Following
                        <Input 
                            className="same-sequence-input leaf-input" 
                            onChange={this.handleWithinFollowingInputChange}
                            onClick={this.handleClickPreventDefault}
                            placeholder="1, 2, 3..."
                            value={this.storeNumericValueToString(withinFollowingInput)}
                            />
                        <SameSequenceDropdownIncrement 
                            dateType={dateType} 
                            increment={withinFollowingInput}
                            onClick={this.handleWithinFollowingDropdownIncrementSelect} />    
                    </div>

                    {/* Anytime after */}
                    <DropdownItem 
                        className={anytimeAfterClasses}
                        onClick={this.handleDropdownSelect.bind(null, SequenceType.AnytimeFollowing)}>
                        Anytime After
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        );
    }

    /*
     * Updates Redux store with current data.
     */
    private updateStoreWithJoinSequence = (joinSequence: SubPanelJoinSequence) => {
        const { dispatch, subPanel, index } = this.props;
        dispatch(setSubPanelJoinSequence(subPanel.panelIndex, index, { ...subPanel.joinSequence, ...joinSequence }));
    }

    /*
     * Sets the text to be displayed in the SubPanel Header
     * (e.g., 'Within +/- 3 Days', 'In the Same Encounter').
     */
    private setDisplayText = () => {
        const { subPanel } = this.props;
        const reg = /^\w/;
        const sequence = subPanel.joinSequence; 
        const text = [ joinSequenceTypes.get(sequence.sequenceType)!.display ];

        if (sequence.sequenceType === SequenceType.PlusMinus || sequence.sequenceType === SequenceType.WithinFollowing ) {
            text.push(`${sequence.increment === null ? 0 : sequence.increment} 
                ${DateIncrementType[sequence.dateIncrementType]
                    .toString()
                    .toLowerCase()
                    .replace(reg, (c: string) => c.toUpperCase())}${sequence.increment === 1 ? '' : 's'}`);
        } else if (sequence.sequenceType === SequenceType.Event) {
            text.push(subPanel.joinSequenceEventType!.name);
        }
        return text.join(' ');
    }
    
    /*
     * Toggles the dropdown and handles possible null values.
     */
    private toggleDropdown = () => {
        const { joinSequence } = this.props.subPanel;
        const dropdownOpen = !this.state.dropdownOpen;

        /*
         * Update store with an increment value of zero if null on
         * dropdown close. This prevents issues with nulls being sent
         * to the server on query run, as the server will always expect
         * a numeric value, and in any case the UI is already displaying '0'.
         */
        if (!dropdownOpen && joinSequence.increment === null) {
            this.updateStoreWithJoinSequence({ ...joinSequence, increment: 0 });
        }

        this.setState({ dropdownOpen });
    }

    /*
     * Handles changes to the given Input. Empty strings default to null.
     */
    private handleInputChange = (text: string, sequenceType: SequenceType): SubPanelJoinSequence | undefined => {
        const { dateIncrementType } = this.props.subPanel.joinSequence;
        let val: any = text;

        if (val === '') { 
            val = null; 
        } else if (!this.isNumeric(val)) { 
            return; 
        } else if (val.length > 0 && val[val.length - 1] !== '.') {
            val = +val;
        }

        return { increment: val, sequenceType, dateIncrementType }
    }

    /*
     * Handles changes to the PlusMinus Input. Empty strings default to null.
     */
    private handleWithinPlusMinusInputChange = (e: any) => {
        const seq = this.handleInputChange(e.target.value, SequenceType.PlusMinus);
        if (!seq) { return; }

        this.setState({ withinPlusMinusInput: seq.increment });
        this.updateStoreWithJoinSequence(seq);
    }

    /*
     * Handles changes to the WithinFollowing Input. Empty strings default to null.
     */
    private handleWithinFollowingInputChange = (e: any) => {
        const seq = this.handleInputChange(e.target.value, SequenceType.WithinFollowing);
        if (!seq) { return; }

        this.setState({ withinFollowingInput: seq.increment });
        this.updateStoreWithJoinSequence(seq);
    }

    /*
     * Handles clicks on the sequence type dropdown. Note that 
     * <input> clicks are intercepted and prevented from triggering this.
     */
    private handleDropdownSelect = (sequenceType: SequenceType) => {
        const { withinPlusMinusInput, withinFollowingInput } = this.state;
        const { joinSequence } = this.props.subPanel;

        switch (sequenceType) {
            case SequenceType.Encounter:
            case SequenceType.Event:
            case SequenceType.AnytimeFollowing:
                this.updateStoreWithJoinSequence({ ...joinSequence, sequenceType });
                return;
            case SequenceType.PlusMinus:
                this.updateStoreWithJoinSequence({ ...joinSequence, increment: withinPlusMinusInput, sequenceType });
                this.toggleDropdown();
                return;
            case SequenceType.WithinFollowing:
                this.updateStoreWithJoinSequence({ ...joinSequence, increment: withinFollowingInput, sequenceType });
                this.toggleDropdown();
                return;
        }
    }

    /*
     * The App Store values are number | null, so this handles stringifying those 
     * to satisfy DOM <input> elements.
     */
    private storeNumericValueToString = (val: number | null): string => val === null ? '' : `${val}`;

    /*
     * Handles selection of a given dateType in the PlusMinus dropdown
     * (e.g., 'Days', 'Hours')
     */
    private handleWithinPlusMinusDropdownIncrementSelect = (dateTypeString: any) => {
        const { withinPlusMinusInput } = this.state;
        const dateIncrementType = DateIncrementType[dateTypeString] as any;
        this.updateStoreWithJoinSequence({ dateIncrementType, increment: withinPlusMinusInput, sequenceType: SequenceType.PlusMinus });
    }

    /*
     * Handles selection of a given dateType in the WithinFollowing dropdown
     * (e.g., 'Days', 'Hours')
     */
    private handleWithinFollowingDropdownIncrementSelect = (dateTypeString: any) => {
        const { withinFollowingInput } = this.state;
        const dateIncrementType = DateIncrementType[dateTypeString] as any;
        this.updateStoreWithJoinSequence({ dateIncrementType, increment: withinFollowingInput, sequenceType: SequenceType.WithinFollowing });
    }

    /*
     * The onClick handler for <input> elements. This prevents the action from
     * bubbling up and inadvertently closing the dropdown, and instead ensures
     * it stays open and the focus moves to the intended <input>.
     */
    private handleClickPreventDefault = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
    }

    /*
     * Validates whether a string input is numeric or not.
     */
    private isNumeric = (val: string): boolean => {
        const value = val.trim();
        if (isNaN(+value) || value.indexOf('.') > -1)           { return false; }
        else if (value.indexOf('0') !== value.lastIndexOf('0')) { return false; }
        else if (val.length === 0)                              { return false; }
        return true;
    }

    /*
     * Checks the current SequenceType in store and adds the
     * 'selected' CSS class if it is.
     */
    private addSelectedClassIfMatched = (classes: string, sequenceType: SequenceType) => {
        return `${classes} ${sequenceType === this.props.subPanel.joinSequence.sequenceType ? 'selected' : ''}`;
    }
}
