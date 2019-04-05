/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row } from 'reactstrap';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import Panel from './Panel';

interface PanelGroupProps {
    dispatch: any;
    panels: PanelModel[];
}

export class PanelGroup extends React.PureComponent<PanelGroupProps> {
    constructor(props: PanelGroupProps) {
        super(props);
    }

    public render() {
        const { panels, dispatch } = this.props;

        return (
            <Row>
                {panels.map((panel: PanelModel, i: number) =>
                    <Panel 
                        dispatch={dispatch}
                        key={panel.id} 
                        isFirst={i === 0}
                        panel={panel}
                    />
                )}
            </Row>
        );
    }
}
