/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import CountDropdown from './CountDropdown';
import CustomDateRangePicker from './CustomDateRangePicker';
import DateDropdown from './DateDropdown';
import InclusionDropdown from './InclusionDropdown';
import { INCLUSION_DROPDOWN_TYPE } from './InclusionDropdown';
import { PanelHandlers } from './PanelGroup';

interface Props {
    handlers: PanelHandlers;
    isFirst: boolean;
    panel: PanelModel;
}

interface State {
    DOMRect?: DOMRect;
    showCustomDateRangeBox: boolean;
}

export default class PanelHeader extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showCustomDateRangeBox: false
        }
    }

    public render() {
        const { handlers, isFirst, panel } = this.props;
        const { DOMRect, showCustomDateRangeBox } = this.state;

        return (
            <div className="panel-header" id={`panel-header-${panel.index}`}>
                <InclusionDropdown 
                    handlers={handlers}
                    inclusionDropdownType={INCLUSION_DROPDOWN_TYPE.PANEL}
                    index={0}
                    isFirst={isFirst} 
                    panel={panel}
                />
                <DateDropdown
                    handlers={handlers}
                    handleCustomDateClick={this.handleCustomDateSelectionClick}
                    panel={panel}
                />
                {showCustomDateRangeBox &&
                <CustomDateRangePicker 
                    handlers={handlers}
                    panel={panel}
                    parentDomRect={DOMRect!}
                    toggleCustomDateRangeBox={this.toggleCustomDateRangeBox}
                />
                }
                <CountDropdown 
                    handlers={handlers}
                    index={0}
                    panel={panel}
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

    private toggleCustomDateRangeBox = (show?: boolean) => {
        const showCustomDateRangeBox = show !== undefined ? show : !this.state.showCustomDateRangeBox;
        this.setState({ showCustomDateRangeBox });
    }
}