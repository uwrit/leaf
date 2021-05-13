/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { VisualizationPage } from '../../../../models/visualization/Visualization';
import './VisualizationPageSidebar.css';

interface Props { 
    clickHandler: (page: VisualizationPage) => any;
    pages: Map<string, VisualizationPage>;
    selectedId?: string;
}

export default class VisualizationPageSidebar extends React.PureComponent<Props> {
    private className = 'visualization-page-sidebar';

    public render() {
        const c = this.className;
        const { clickHandler, pages, selectedId } = this.props;
        const barClass = `${c}-item`;

        return (
            <div className={c}>
                <ul className={`${c}-inner`}>
                    
                {[ ...pages.values() ].map(page => {

                    const classes = [ barClass ];
                    if (selectedId && page.id === selectedId) {
                        classes.push('selected');
                    }

                    return (
                        <li className={classes.join(' ')} key={page.id} onClick={clickHandler.bind(null, page)}>
                            {page.pageName}
                        </li>
                    );
                })}
                </ul>
            </div>
        );
    }
}