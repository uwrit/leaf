/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row } from 'reactstrap';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import Panel from './Panel';

interface PanelGroupProps {
    panels: PanelModel[];
}

export class PanelGroup extends React.PureComponent<PanelGroupProps> {
    constructor(props: PanelGroupProps) {
        super(props);
    }

    public render() {
        const panels = this.props.panels.map((panel: PanelModel, i: number) =>
            <Panel 
                key={panel.id} 
                isFirst={i === 0 ? true : false}
                panel={panel}
            />
        );

        return (
            <Row>
                {panels}
            </Row>
        );
    }
}
