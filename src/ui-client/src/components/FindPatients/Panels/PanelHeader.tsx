/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { setPanelDateFilter } from '../../../actions/panels';
import { DateBoundary, DateIncrementType } from '../../../models/panel/Date';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import CountDropdown from './CountDropdown';
import CustomDateRangePicker from './CustomDateRangePicker';
import DateDropdown from './DateDropdown';
import InclusionDropdown from './InclusionDropdown';
import { inclusionDropdownType } from './InclusionDropdown';

interface State {
    DOMRect?: DOMRect;
    showCustomDateRangeBox: boolean;
}

interface Props {
    dispatch: any;
    isFirst: boolean;
    panel: PanelModel;
}

let dateConfigBeforeOpenCustom: DateBoundary = { 
    display: 'Anytime', 
    end: { dateIncrementType: DateIncrementType.NONE },  
    start: { dateIncrementType: DateIncrementType.NONE }
};

class PanelHeader extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showCustomDateRangeBox: false
        }
    }

    public render() {
        return (
            <div className="panel-header" id={`panel-header-${this.props.panel.index}`}>
                <InclusionDropdown 
                    dispatch={this.props.dispatch}
                    inclusionDropdownType={inclusionDropdownType.PANEL}
                    index={0}
                    isFirst={this.props.isFirst} 
                    panel={this.props.panel}
                />
                <DateDropdown
                    dispatch={this.props.dispatch}
                    handleCustomDateClick={this.handleCustomDateSelectionClick}
                    panel={this.props.panel}
                />
                {this.state.showCustomDateRangeBox &&
                <CustomDateRangePicker 
                    dispatch={this.props.dispatch}
                    panel={this.props.panel}
                    parentDomRect={this.state.DOMRect!}
                    toggleCustomDateRangeBox={this.toggleCustomDateRangeBox}
                />
                }
                <CountDropdown 
                    dispatch={this.props.dispatch}
                    index={0}
                    panel={this.props.panel}
                /> 
            </div>
        );
    }

    private handleCustomDateSelectionClick = (e: any) => {
        const domRect: DOMRect = e.target.getBoundingClientRect();
        this.setState({ 
            DOMRect: domRect, 
            showCustomDateRangeBox: true
        });
    }

    private toggleCustomDateRangeBox = (defaultDateFilter: boolean = false) => {
        const showCustomDateRangeBox = !this.state.showCustomDateRangeBox;
        this.setState({ showCustomDateRangeBox });

        if (!showCustomDateRangeBox && defaultDateFilter) {
            this.props.dispatch(setPanelDateFilter(this.props.panel.index, dateConfigBeforeOpenCustom));
        }
        else if (defaultDateFilter) {
            dateConfigBeforeOpenCustom = this.props.panel.dateFilter;
        }
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return { dispatch };
}

export default connect(null, mapDispatchToProps)(PanelHeader)