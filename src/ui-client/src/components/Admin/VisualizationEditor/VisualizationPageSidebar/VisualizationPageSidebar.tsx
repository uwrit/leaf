/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { setAdminCurrentVisualizationPage } from '../../../../actions/admin/visualizations';
import { showInfoModal } from '../../../../actions/generalUi';
import { AdminVisualizationPage } from '../../../../models/admin/Visualization';
import { AdminVisualizationState } from '../../../../models/state/AdminState';
import { InformationModalState } from '../../../../models/state/GeneralUiState';

interface Props { 
    data: AdminVisualizationState;
    dispatch: any;
}

export default class VisualizationPageSidebar extends React.PureComponent<Props> {
    private className = 'visualization-page-sidebar';

    public render() {
        const c = this.className;
        const { data } = this.props;
        const barClass = `${c}-item`;

        return (
            <div className={c}>
                <ul className={`${c}-inner`}>
                {[ ...data.pages.values() ].map(page => {
                    const classes = [ barClass ];
                    if (data.selectedId && page.id === data.selectedId) {
                        classes.push('selected');
                    }

                    return (
                        <li className={classes.join(' ')} key={page.id} onClick={this.handleClick.bind(null, page)}>
                            {page.pageName}
                        </li>
                    );
                })}
                </ul>
            </div>
        );
    }

    private handleClick = (page: AdminVisualizationPage) => {
        const { data, dispatch } = this.props;

        if (data.changed) {
            const info: InformationModalState = {
                body: "Please Save or Undo your changes",
                header: "Save or Undo Changes",
                show: true
            };
            dispatch(showInfoModal(info));
        }

        dispatch(setAdminCurrentVisualizationPage(page));
    }
}