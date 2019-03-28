/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col } from 'reactstrap';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import PanelHeader from './PanelHeader';
import SubPanel from './SubPanel';
import { DateIncrementType } from '../../../models/panel/Date';
import './Panel.css';

export interface Props {
    panel: PanelModel,
    isFirst: boolean;
}

export default class Panel extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { isFirst, panel } = this.props;
        const isDateFiltered = 
            panel.dateFilter.end.dateIncrementType !== DateIncrementType.NONE && 
            panel.dateFilter.start.dateIncrementType !== DateIncrementType.NONE;
        let isCountFiltered = false;
        let hasPanelItems = false;
        let hasSequentialJoin = false;

        for (const subPanel of panel.subPanels) {
            if (subPanel.panelItems.filter((pi) => !pi.hidden).length) { hasPanelItems = true; }
            if (subPanel.index > 0 && subPanel.panelItems.length)      { hasSequentialJoin = true; }
            if (subPanel.minimumCount > 1)                             { isCountFiltered = true; }
        }
        // Set classes
        const classes = [ 'panel', (hasPanelItems ? 'has-data' : 'no-data') ];
        if (!panel.includePanel) { classes.push('panel-excluded'); }
        if (isDateFiltered)      { classes.push('panel-date-filtered'); }
        if (hasSequentialJoin)   { classes.push('panel-sequential-join'); }
        if (isCountFiltered)     { classes.push('panel-count-filtered'); }

        return (
            <Col className="panel-column" md={4}>
                <div className={classes.join(' ')}>
                    <PanelHeader isFirst={isFirst} panel={panel} />
                    {panel.subPanels.map((subpanel,i) => (
                        <SubPanel 
                            key={subpanel.id}
                            index={i}
                            panel={this.props.panel}
                            subPanel={subpanel}
                        />
                    ))}
                </div>
            </Col>
        );
    }
}
