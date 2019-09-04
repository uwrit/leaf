/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { PanelFilter as PanelFilterModel } from '../../../models/panel/PanelFilter';
import CheckboxSlider from '../../Other/CheckboxSlider/CheckboxSlider';
import { togglePanelFilter } from '../../../actions/panelFilter';
import './PanelFilterGroup.css';

interface Props {
    dispatch: any;
    filters: PanelFilterModel[];
}

export default class PanelFilterSelectionBox extends React.PureComponent<Props> {
    private className = 'panel-filter';

    public render() {
        const { filters } = this.props;
        const c = this.className;
        
        return (
            <div className={`${c}-selection-box`}>
                <div className={`${c}-selection-title`}>
                    <p>
                        The options below allow you to add criteria to your query without 
                        dragging additional Concepts over. These are just for convenience, and are completely optional.
                    </p>
                </div>
                <div className={`${c}-selection-body`}>
                    {filters.length === 0 &&
                    <div className={`${c}-no-filters`}>
                        It looks like your administrator hasn't added these yet!
                    </div>
                    }
                    {filters.map((f: PanelFilterModel) => {
                    return (
                        <div key={f.id}>
                            <div className={`${c}-selection-row`}>
                                <div className={`${c}-selection-row-title`}>{f.uiDisplayText}</div>
                                <CheckboxSlider checked={f.isActive} onClick={this.handleSelectionBoxItemClick.bind(null, f)} />
                            </div>
                            <div className={`${c}-selection-row-description-container`}>
                                <p className={`${c}-selection-row-description`}>{f.uiDisplayDescription}</p>
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        );
    }

    private handleSelectionBoxItemClick = (filter: PanelFilterModel) => {
        const { dispatch } = this.props;
        dispatch(togglePanelFilter(filter, !filter.isActive));
    }
}