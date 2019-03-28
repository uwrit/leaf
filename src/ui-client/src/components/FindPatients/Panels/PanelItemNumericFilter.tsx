/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
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
import { NumericFilterType } from '../../../models/panel/NumericFilter';
import { InformationModalState } from '../../../models/state/GeneralUiState';
import { AppState } from '../../../models/state/AppState';
import './PanelItemNumericFilter.css';

interface Props {
    dispatch: any;
    panelItem: PanelItem; 
    panels: any;
}

interface State {
    DOMRect?: DOMRect;
    showSelectionBox: boolean;
    showDropdown: boolean;
    tempFilter: LocalTempFilter;
}

interface EqualityValue {
    enum: number;
    operator: string;
    display: string;
}

interface LocalTempFilter {
    filter: any[];
    filterType: NumericFilterType;
}

const types: EqualityValue[] = [
    { enum: NumericFilterType.GreaterThanOrEqualTo, display: 'Greater than or equal (>=)', operator: '>=' },
    { enum: NumericFilterType.GreaterThan, display: 'Greater than (>)', operator: '>' },
    { enum: NumericFilterType.LessThanOrEqualTo, display: 'Less than or equal (<=)', operator: '<=' },
    { enum: NumericFilterType.LessThan, display: 'Less Than (<)', operator: '<' },
    { enum: NumericFilterType.EqualTo, display: 'Equal to (=)', operator: '=' },
    { enum: NumericFilterType.Between, display: 'Between', operator: 'BETWEEN' },
    { enum: NumericFilterType.None, display: '', operator: '' }
];
const defaultFilter: LocalTempFilter = { 
    filter: ['', ''], 
    filterType: types[0].enum
}

class PanelItemNumericFilter extends React.Component<Props, State> {
    private baseClassName = 'panel-item-numeric'; 
    private className = `${this.baseClassName}-selection`;
    private mouseOutBubbleUpMillisecondThreshold = 150;
    private lastMouseOutClickTime: number = 0;
    constructor(props: Props) {
        super(props);
        this.state = {
            showDropdown: false,
            showSelectionBox: false,
            tempFilter: props.panelItem.numericFilter.filterType !== NumericFilterType.None 
                ? props.panelItem.numericFilter 
                : defaultFilter
        }
    }
    
    public render(): any {
        const { concept } = this.props.panelItem;
        const isBetween = this.state.tempFilter.filterType === NumericFilterType.Between;
        const selectedType = this.state.tempFilter.filterType === NumericFilterType.None 
            ? types[0]
            : types.find((p: EqualityValue) => p.enum === this.state.tempFilter.filterType)!; 
        const classes = [this.className, (isBetween ? `${this.className}-between` : '')];
        const display = this.setNumericDisplayText();
        const items = types
            .filter((t: EqualityValue) => t.enum !== NumericFilterType.None)
            .map((t: EqualityValue) => {
                const classed = `leaf-dropdown-item ${t.enum === this.state.tempFilter.filterType ? 'selected' : ''}`;
                return <DropdownItem className={classed} key={t.enum} onMouseUp={this.handleDropdownItemSelect}>{t.display}</DropdownItem>
            });
        
        return (
            <div 
                className={`${this.baseClassName}-text`} 
                onClick={this.handleSelectionTextClick}>
                {display}
                {this.state.showSelectionBox && 
                <PopupBox parentDomRect={this.state.DOMRect!} 
                    toggle={this.handleSelectionBoxClickedOutside}>
                    <div className={classes.join(' ')}>
                        <div className={`${this.className}-title`}>Filter {concept.uiDisplayName} {concept.uiDisplayUnits && `(${concept.uiDisplayUnits})`}</div>
                        <div className={`${this.className}-body`}>
                            <InputGroup>
                                <InputGroupButtonDropdown 
                                    addonType="append" 
                                    isOpen={this.state.showDropdown} 
                                    toggle={this.toggleDropdown}>
                                    <DropdownToggle 
                                        caret={true} 
                                        className={`${this.className}-type`}>
                                        {selectedType.display}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {items}
                                    </DropdownMenu>
                                </InputGroupButtonDropdown>
                                {!isBetween && 
                                <Input 
                                    className={`${this.className}-number leaf-input`} 
                                    onChange={this.handleNumberInputChange}
                                    placeholder="1, 2, 3..." 
                                    value={this.state.tempFilter.filter[0]} />
                                }
                                {isBetween && 
                                <div className={`${this.className}-between-container`}>
                                    <Input 
                                        className={`${this.className}-number ${this.className}-number-low leaf-input`} 
                                        onChange={this.handleNumberInputChange}
                                        placeholder="Low"
                                        value={this.state.tempFilter.filter[0]} />
                                    <span className={`${this.className}-and`}>and</span>
                                    <Input 
                                        className={`${this.className}-number ${this.className}-high leaf-input`} 
                                        onChange={this.handleHighRangeInputChange}
                                        placeholder="High"
                                        value={this.state.tempFilter.filter[1]} />
                                </div>
                                }
                            </InputGroup>
                        </div>
                        <div className={`${this.className}-footer`}>
                            <Button className="leaf-button leaf-button-secondary" onClick={this.handleClickClearFilter}>Clear Filter</Button>
                            <Button className="leaf-button leaf-button-secondary" onClick={this.handleClickAddFilter} style={{ float: 'right' }}>Add Filter</Button>
                        </div>
                    </div>
                </PopupBox>
                }
            </div>
        );
    }

    private updateStoreWithFilter = () => {
        const pi = this.props.panelItem;
        const temp = this.state.tempFilter;
        const filter = {
            filter: (temp.filterType !== NumericFilterType.Between
                ? [temp.filter[0]]
                : temp.filter) 
                    .map((v: string) => +(v[v.length - 1] === '.' ? `${v}0` : v)),
            filterType: temp.filterType
        }
        this.props.dispatch(
            setPanelItemNumericFilter(
                pi.concept,
                pi.panelIndex,
                pi.subPanelIndex,
                pi.index,
                filter
            )
        );
    }

    private handleDropdownItemSelect = (e: any) => {
        const text = e.target.innerText;
        const selectedType: EqualityValue = types.find((p: EqualityValue) => p.display === text)!; 
        this.setState({
            tempFilter: {
                filter: this.state.tempFilter.filter,
                filterType: selectedType.enum
            }
        });
    }

    private handleNumberInputChange = (e: any) => {
        const value: string = e.target.value.trim();
        if (!this.isValidNumericInput(value)) { return; }

        this.setState({
            tempFilter: {
                filter: [ value, this.state.tempFilter.filter[1] ],
                filterType: this.state.tempFilter.filterType
            }
        });
    }

    private handleHighRangeInputChange = (e: any) => {
        const value = e.target.value.trim();
        if (!this.isValidNumericInput(value)) { return; }

        this.setState({
            tempFilter: {
                filter: [ this.state.tempFilter.filter[0], value ],
                filterType: this.state.tempFilter.filterType
            }
        });
    }

    private isValidNumericInput = (val: string, allowEmpty: boolean = true): boolean => {
        const firstDecimal = val.indexOf('.');

        if (isNaN(+val) && val[val.length - 1] !== '.') { return false; }
        else if (firstDecimal > -1 && firstDecimal !== val.lastIndexOf('.')) { return false; }
        else if (!allowEmpty && val.length === 0) { return false; }
        return true;
    }

    private isTempFilterValid = (): boolean => {
        const type = this.state.tempFilter.filterType;
        const val1 = this.state.tempFilter.filter[0];
        const val2 = this.state.tempFilter.filter[1];
        const val1Valid = this.isValidNumericInput(val1, false);
        const val2Valid = this.isValidNumericInput(val2, false);
        
        if (type === NumericFilterType.Between && val1Valid && val2Valid && +val1 < +val2) {
            return true;
        }
        else if (type !== NumericFilterType.Between && val1Valid) {
            return true;
        }
        return false;
    }

    private setNumericDisplayText = () => {
        const type = this.state.tempFilter.filterType;
        const val1 = this.state.tempFilter.filter[0];
        const val2 = this.state.tempFilter.filter[1];
        const units = this.props.panelItem.concept.uiDisplayUnits;
        const display = 
            type === NumericFilterType.Between ? `${types.find((p: EqualityValue) => p.enum === NumericFilterType.Between)!.operator} ${val1} and ${val2} ${units}` :
            val1 === '' ? this.props.panelItem.concept.uiNumericDefaultText :
            `${types.find((p: EqualityValue) => p.enum === type)!.operator} ${val1} ${units}`

        return display;
    }   

    private toggleDropdown = () => this.setState({ showDropdown: !this.state.showDropdown });

    private handleSelectionTextClick = (e: any) => { 
        const timeSinceMouseOutClicked = (new Date().getTime() - this.lastMouseOutClickTime);

        if (timeSinceMouseOutClicked > this.mouseOutBubbleUpMillisecondThreshold && 
            e.target.className === e.currentTarget.className
        ) {
            const domRect: DOMRect = e.target.getBoundingClientRect();
            this.setState({ 
                DOMRect: domRect, 
                showSelectionBox: !this.state.showSelectionBox, 
                tempFilter: !this.state.showSelectionBox ? defaultFilter : this.state.tempFilter
            });
        }
    }

    private handleSelectionBoxClickedOutside = () => {
        this.lastMouseOutClickTime = new Date().getTime();
        this.setState({ 
            showSelectionBox: !this.state.showSelectionBox, 
            tempFilter: !this.state.showSelectionBox ? defaultFilter : this.state.tempFilter
        });
    }

    private handleClickAddFilter = () => {
        const { dispatch } = this.props;

        if (this.isTempFilterValid()) {
            this.updateStoreWithFilter();
            this.setState({ showSelectionBox: false });
        }
        else {
            const info: InformationModalState = {
                body: 'Numeric filters must be correctly formatted numbers, and if using "Between", the lower range number must be less than the higher.',
                header: 'Error adding numeric filter',
                show: true
            }
            dispatch(showInfoModal(info));
        }
    }

    private handleClickClearFilter = () => {
        this.setState({
            showSelectionBox: false,
            tempFilter: defaultFilter
        });
    }
}

// Not sure if this is a Redux bug or intended behavior, but 
// if we don't define something (anything) in mapStateToProps(), 
// changes in the <Input> fields aren't updated in the UI, likely
// because React thinks state never changes. Therefore though it's
// a waste, panels are added as a prop here.
const mapStateToProps = (state: AppState) => {
    return {
        panels: state.panels
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return { 
        dispatch
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PanelItemNumericFilter);