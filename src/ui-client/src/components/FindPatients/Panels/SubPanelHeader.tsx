/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import CountDropdown from './CountDropdown';
import InclusionDropdown from './InclusionDropdown';
import { INCLUSION_DROPDOWN_TYPE } from './InclusionDropdown'
import SameSequenceDropdown from './SameSequenceDropdown';

interface Props {
    dispatch: any;
    index: number;
    panel: PanelModel;
}

export default class SubPanelHeader extends React.PureComponent<Props> {
    public render(): any {
        const { panel, index, dispatch } = this.props;
        const subpanel = panel.subPanels[index];
        const classes = [ 'subpanel-header' ];
        let content: any; 

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
                        dispatch={dispatch}
                        inclusionDropdownType={INCLUSION_DROPDOWN_TYPE.SUBPANEL}
                        index={index}
                        isFirst={false} 
                        panel={panel} 
                    />
                    <SameSequenceDropdown
                        dispatch={dispatch}
                        index={index}
                        subPanel={subpanel}
                    /> 
                    <CountDropdown 
                        dispatch={dispatch}
                        index={index}
                        panel={panel}
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