/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Panel as PanelModel } from '../../../../../models/panel/Panel';
import Panel from '../../../../FindPatients/Panels/Panel';
import { createPortal } from 'react-dom';
import './PanelPreview.css';

interface Props {
    panel: PanelModel;
}

export class PanelPreview extends React.PureComponent<Props> {
    private className = 'concept-editor-preview';
    public render() {
        const { panel } = this.props;
        const c = this.className;
        return (
            createPortal(
                <div className={`${c}-panel-container concept-editor-preview`}>
                    <div className={`${c}-panel-container-inner`}>
                        <Panel panel={panel} isFirst={true} />
                    </div>
                </div>,
                document.body
            )
        );
    }
};
