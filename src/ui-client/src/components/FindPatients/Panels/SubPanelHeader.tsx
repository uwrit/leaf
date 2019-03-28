/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import CountDropdown from './CountDropdown';
import InclusionDropdown from './InclusionDropdown';
import { inclusionDropdownType } from './InclusionDropdown'
import SameSequenceDropdown from './SameSequenceDropdown';

interface Props {
    dispatch: any;
    index: number;
    panel: PanelModel;
}

class SubPanelHeader extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render(): any {
        let content: any; 
        const subpanel = this.props.panel.subPanels[this.props.index];
        const classes = [ 'subpanel-header' ];

        if (!subpanel.includeSubPanel) {
            classes.push('subpanel-excluded');
        }
        
        if (subpanel.panelItems.length === 0) {
            content = <div className="subpanel-header-preview">In the Same Encounter</div>;
            classes.push('no-data');
        }
        else {
            content = 
                <div>
                    <InclusionDropdown 
                        dispatch={this.props.dispatch}
                        inclusionDropdownType={inclusionDropdownType.SUBPANEL}
                        index={this.props.index}
                        isFirst={false} 
                        panel={this.props.panel} 
                    />
                    <SameSequenceDropdown
                        dispatch={this.props.dispatch}
                        index={this.props.index}
                        SubPanel={this.props.panel.subPanels[this.props.index]}
                    /> 
                    <CountDropdown 
                        dispatch={this.props.dispatch}
                        index={this.props.index}
                        panel={this.props.panel}
                    /> 
                </div>;
        }

        return (
            <div className={classes.join(' ')}>
                {content}
            </div>
        )       
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return { dispatch };
}

export default connect(null, mapDispatchToProps)(SubPanelHeader)