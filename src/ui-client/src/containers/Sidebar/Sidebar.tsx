/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { handleSidebarTabClick } from '../../actions/generalUi';
import { SidebarTab} from '../../components/Sidebar/SidebarTab';
import { RouteConfig } from '../../config/routes';
import { CohortStateType } from '../../models/state/CohortState';
import { Routes } from '../../models/state/GeneralUiState';
import { AdminPanelPane } from '../../models/state/AdminState';
import './Sidebar.css';

interface Props {
    cohortCountState: CohortStateType;
    currentAdminPane: AdminPanelPane;
    currentRoute: Routes;
    dispatch: any;
    routes: RouteConfig[];
}

export default class Sidebar extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
        this.state = { activeIndex: 0 };
    }

    public render() {
        const { cohortCountState, currentRoute, currentAdminPane, dispatch, routes } = this.props;
        const cohortLoaded = cohortCountState === CohortStateType.LOADED;
        const c = 'sidebar';
        return (
            <div id={`${c}-container`}>
                <div id={c}>
                    <ul className={`${c}-tab-list`}>
                        {routes.map((e: RouteConfig) => (
                            <SidebarTab 
                                key={e.index} 
                                clickHandler={this.handleTabClick} 
                                config={e}
                                currentAdminPane={currentAdminPane}
                                dispatch={dispatch}
                                isActive={e.index === currentRoute}
                                selectable={cohortLoaded || (e.index === Routes.FindPatients || e.index === Routes.AdminPanel || e.index === Routes.Help)}
                                />
                            ))}
                    </ul>
                </div>
            </div>
        );
    }  
    
    private handleTabClick = (route: Routes) => {
        const { dispatch } = this.props;
        dispatch(handleSidebarTabClick(route));
    }
};