/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { createPortal } from 'react-dom';
import { PanelFilter as PanelFilterModel } from '../../../../models/admin/PanelFilter';
import PanelFilterSelectionBox from '../../../FindPatients/PanelFilter/PanelFilterSelectionBox';
import './PanelFilterPreview.css';

interface Props {
    panelFilter: PanelFilterModel;
}

export class PanelFilterPreview extends React.PureComponent<Props> {
    private className = 'panelfilter-editor-preview';
    public render() {
        const { panelFilter } = this.props;
        const c = this.className;
        const pf: any = { ...panelFilter, isActive: true };

        return (
            createPortal(
                <div className={`${c}-container ${c}`}>
                    <div className={`${c}-container-inner`}>
                        <PanelFilterSelectionBox dispatch={this.dummyDispatch} filters={[ pf ]} />
                    </div>
                </div>,
                document.body
            )
        );
    }

    private dummyDispatch = () => null as any;
};
