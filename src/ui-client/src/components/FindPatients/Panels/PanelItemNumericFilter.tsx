/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Button, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupButtonDropdown } from 'reactstrap';
import { setPanelItemNumericFilter } from '../../../actions/panels';
import { showInfoModal } from '../../../actions/generalUi';
import PopupBox from '../../Other/PopupBox/PopupBox';
import { PanelItem } from '../../../models/panel/PanelItem';
import { NumericFilterType, NumericFilter } from '../../../models/panel/NumericFilter';
import { InformationModalState } from '../../../models/state/GeneralUiState';
import './PanelItemNumericFilter.css';

interface Props {
    dispatch: any;
    panelItem: PanelItem;
}

interface State {
    DOMRect?: DOMRect;
    showSelectionBox: boolean;
    showDropdown: boolean;
}

interface EqualityValue {
    enum: number;
    operator: string;
    display: string;
}

const types: EqualityValue[] = [
    { enum: NumericFilterType.GreaterThanOrEqualTo, display: 'Greater than or equal (>=)', operator: '>=' },
    { enum: NumericFilterType.GreaterThan, display: 'Greater than (>)', operator: '>' },
    { enum: NumericFilterType.LessThanOrEqualTo, display: 'Less than or equal (<=)', operator: '<=' },
    { enum: NumericFilterType.LessThan, display: 'Less Than (<)', operator: '<' },
    { enum: NumericFilterType.EqualTo, display: 'Equal to (=)', operator: '=' },
    { enum: NumericFilterType.Between, display: 'Between', operator: 'between' },
    { enum: NumericFilterType.None, display: '', operator: '' }
];

const options = types.filter((t: EqualityValue) => t.enum !== NumericFilterType.None);

export default class PanelItemNumericFilter extends React.Component<Props, State> {
    private baseClassName = 'panel-item-numeric'; 
    private className = `${this.baseClassName}-selection`;
    private mouseOut = true;
    constructor(props: Props) {
        super(props);
        this.state = {
            showDropdown: false,
            showSelectionBox: false
        }
    }

    public render(): any {
        const { panelItem } = this.props;
        const { filterType, filter } = panelItem.numericFilter;
        const { showSelectionBox, showDropdown, DOMRect } = this.state;
        const b = this.baseClassName;
        const c = this.className;
        const isBetween = filterType === NumericFilterType.Between;
        const classes = [c, (isBetween ? `${c}-between` : '')];
        const display = filterType === NumericFilterType.None 
            ? types[0].display
            : types.find((p: EqualityValue) => p.enum === filterType)!.display;
        const val1 = `${filter[0] === null ? '' : filter[0]}`;
        const val2 = `${filter[1] === null ? '' : filter[1]}`;

        return (
            <div className={`${b}-text`} onClick={this.handleSelectionTextClick}>
                {this.setNumericDisplayText()}

                {/* Selection Box */}
                {showSelectionBox && 
                <PopupBox parentDomRect={DOMRect!} toggle={this.handleSelectionBoxClickedOutside}>
                    <div className={classes.join(' ')} 
                        onBlur={this.handleBlur}
                        onMouseLeave={this.handleMouseLeave} 
                        onMouseEnter={this.handleMouseEnter}
                        tabIndex={0}>
                        <span className={`${c}-close`} onClick={this.handleClickClearFilter}>x</span>
                        <div className={`${c}-body`}>
                            <InputGroup>

                                {/* Inequality Dropdown */}
                                <InputGroupButtonDropdown 
                                    addonType="append" 
                                    isOpen={showDropdown} 
                                    toggle={this.toggleDropdown}>
                                    <DropdownToggle 
                                        caret={true} 
                                        className={`${c}-type`}>
                                        {display}
                                    </DropdownToggle>
                                    <DropdownMenu>

                                        {/* Equality Options */}
                                        {options.map((t: EqualityValue) => {
                                            const classed = `leaf-dropdown-item ${t.enum === filterType ? 'selected' : ''}`;
                                            return (
                                                <DropdownItem 
                                                    className={classed} 
                                                    key={t.enum} 
                                                    onMouseUp={this.handleDropdownItemSelect.bind(null,t)}>
                                                    {t.display}
                                                </DropdownItem>
                                        )})}

                                    </DropdownMenu>
                                </InputGroupButtonDropdown>

                                {/* Main non-between Input */}
                                {!isBetween && 
                                <Input 
                                    className={`${c}-number leaf-input`} 
                                    onChange={this.handleInputOneChange}
                                    placeholder="1, 2, 3..." 
                                    value={val1} />
                                }

                                {/* Between Input */}
                                {isBetween && 
                                <div className={`${c}-between-container`}>

                                    {/* High val */}
                                    <Input 
                                        className={`${c}-number ${c}-number-low leaf-input`} 
                                        onChange={this.handleInputOneChange}
                                        placeholder="Low"
                                        value={val1} 
                                    />

                                    <span className={`${c}-and`}>and</span>

                                    {/* Low val */}
                                    <Input 
                                        className={`${c}-number ${c}-high leaf-input`} 
                                        onChange={this.handleInputTwoChange}
                                        placeholder="High"
                                        value={val2} 
                                    />
                                </div>
                                }
                            </InputGroup>
                        </div>
                    </div>
                </PopupBox>
                }
            </div>
        );
    }

    /*
     * Dispatches an update to Redux store after input change.
     */
    private dispatchUpdate = (filter: NumericFilter) => {
        const { panelItem, dispatch } = this.props;
        const pi = panelItem;
        dispatch(setPanelItemNumericFilter(pi.concept, pi.panelIndex, pi.subPanelIndex, pi.index, filter));
    }

    /*
     * Handles changes to the equality value dropdown (e.g., >, <, =).
     */
    private handleDropdownItemSelect = (ev: EqualityValue) => {
        const { numericFilter } = this.props.panelItem;
        const newFilter = Object.assign({}, numericFilter, { filterType: ev.enum });
        this.dispatchUpdate(newFilter);
    }

    /*
     * Handles changes to value one input.
     */
    private handleNumberInputChange = (e: any, isFirst: boolean) => {
        const { numericFilter } = this.props.panelItem;
        let val = e.target.value.trim();

        if (val === '') { 
            val = null; 
        } else if (!this.isNumeric(val)) { 
            return; 
        } else if (val.length > 0 && val[val.length - 1] !== '.') {
            val = parseFloat(val);
        }

        const newFilter = Object.assign({}, numericFilter, { 
            filter: isFirst 
                ? [ val, numericFilter.filter[1] ]
                : [ numericFilter.filter[0], val ], 
            filterType: numericFilter.filterType === NumericFilterType.None ? types[0].enum : numericFilter.filterType
        });
        this.dispatchUpdate(newFilter);
    }

    private handleInputOneChange = (e: any) => this.handleNumberInputChange(e, true);

    private handleInputTwoChange = (e: any) => this.handleNumberInputChange(e, false);

    /*
     * Checks if a value is numeric.
     */
    private isNumeric = (val: string): boolean => {
        const firstDecimal = val.indexOf('.');

        if (isNaN(+val) && val[val.length - 1] !== '.') { return false; }
        else if (firstDecimal > -1 && firstDecimal !== val.lastIndexOf('.')) { return false; }
        else if (val.length === 0) { return false; }
        return true;
    }

    /*
     * Sets the text displayed in the panel item.
     */
    private setNumericDisplayText = () => {
        const { panelItem } = this.props;
        const { filter, filterType } = panelItem.numericFilter;
        const [ val1, val2 ] = filter;
        const { uiNumericDefaultText, uiDisplayUnits } = panelItem.concept;
        const units = uiDisplayUnits ? uiDisplayUnits : '';

        if (filterType === NumericFilterType.None || val1 === null) {
            return uiNumericDefaultText;
        } else if (filterType === NumericFilterType.Between && val2 === null) {
            return uiNumericDefaultText;
        } else if (filterType === NumericFilterType.Between) {
            const between = types.find((p: EqualityValue) => p.enum === NumericFilterType.Between)!;
            return `${between.operator} ${val1} and ${val2} ${units}`;
        } else {
            const ev = types.find((p: EqualityValue) => p.enum === filterType)!;
            return `${ev.operator} ${val1} ${units}`;
        }
    }   

    /*
     * Toggles dropdown 'isOpen' state.
     */
    private toggleDropdown = () => this.setState({ showDropdown: !this.state.showDropdown });

    /*
     * Sets selection text click time to head off
     * false positive detections of clicks outside the box 
     * (which auto-hide the selection box, perhaps unintentionally).
     */
    private handleSelectionTextClick = (e: any) => { 
        if (e.target.className !== "panel-item-numeric-text") { return; }
        const domRect: DOMRect = e.target.getBoundingClientRect();
        this.setState({ DOMRect: domRect, showSelectionBox: true });
    }

    /*
     * Hides the selection box if clicked outside.
     */
    private handleSelectionBoxClickedOutside = () => {
        this.setState({ showSelectionBox: !this.state.showSelectionBox });
    }

    /*
     * Clears any current filter and hides the selection box.
     */
    private handleClickClearFilter = () => {
        const newFilter: NumericFilter = { filter: [null, null], filterType: NumericFilterType.None };
        this.dispatchUpdate(newFilter);
        this.setState({ showSelectionBox: false });
    }

    /*
     * Handles cursor focus away from the selection box, which
     * if the mouse is outside it ensures the box gracefully closes.
     */
    private handleBlur = () => {
        if (this.mouseOut) {
            this.setState({ showSelectionBox: false });
        }
    }

    private handleMouseEnter = () => this.mouseOut = false;

    private handleMouseLeave = () => this.mouseOut = true;
}