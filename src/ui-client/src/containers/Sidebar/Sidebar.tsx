/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux'
import { handleSidebarTabClick } from '../../actions/generalUi';
import { SidebarTab} from '../../components/Sidebar/SidebarTab';
import { RouteConfig } from '../../config/routes';
import { AppState } from '../../models/state/AppState';
import { CohortStateType } from '../../models/state/CohortState';
import { Routes } from '../../models/state/GeneralUiState';
import './Sidebar.css';

interface StateProps {
    cohortCountState: CohortStateType;
    routes: RouteConfig[];
}

interface DispatchProps {
    dispatch: any;
}

interface OwnProps {
    currentRoute: Routes;
}

type Props = StateProps & DispatchProps & OwnProps;

class Sidebar extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.state = { activeIndex: 0 };
    }

    public render() {
        const { cohortCountState, currentRoute, routes } = this.props;
        const cohortLoaded = cohortCountState === CohortStateType.LOADED;
        const c = 'sidebar';
        return (
            <div id={`${c}-container`}>
                <div id={c}>
                    <ul className={`${c}-tab-list`}>
                        {routes.map((e: RouteConfig) => (
                            <SidebarTab 
                                key={e.index} 
                                selectable={cohortLoaded || (e.index === Routes.FindPatients || e.index === Routes.AdminPanel)}
                                icon={e.icon}
                                index={e.index}
                                display={e.display} 
                                isActive={e.index === currentRoute}
                                path={e.path} 
                                clickHandler={this.handleTabClick} 
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

const mapStateToProps = (state: AppState): StateProps => {
    return { 
        cohortCountState: state.cohort.count.state,
        routes: state.generalUi.routes
    };
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) : DispatchProps => {
    return { 
        dispatch
    }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(Sidebar);