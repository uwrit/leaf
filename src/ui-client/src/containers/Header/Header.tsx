/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { FaDoorOpen, FaStar } from 'react-icons/fa';
import { FiUser, FiShield, FiUserCheck, FiGlobe, FiAlertOctagon } from 'react-icons/fi';
import { Dispatch } from 'redux';
import { connect } from 'react-redux'
import { Navbar } from 'reactstrap';
import { Nav, NavItem } from 'reactstrap';
import { setCohortCountBoxState, toggleSaveQueryPane, setRoute, showConfirmationModal, toggleMyLeafModal, showInfoModal } from '../../actions/generalUi';
import { resetPanels } from '../../actions/panels';
import NetworkHealthResponder from '../../components/Header/NetworkHealthResponder/NetworkHealthResponder';
import { AppState } from '../../models/state/AppState';
import { UserContext, AppConfig } from '../../models/Auth';
import { CohortStateType } from '../../models/state/CohortState';
import { NetworkIdentity, NetworkResponderMap } from '../../models/NetworkResponder';
import { Panel } from '../../models/panel/Panel';
import CohortSummary from './CohortSummary';
import { Routes, ConfirmationModalState } from '../../models/state/GeneralUiState';
import { SavedQueriesState } from '../../models/Query';
import { setCurrentQuery, setRunAfterSave } from '../../actions/queries';
import { PanelFilter } from '../../models/panel/PanelFilter';
import { getPanelItemCount } from '../../utils/panelUtils';
import { FaDatabase, FaChevronDown } from 'react-icons/fa';
import { logout } from '../../actions/session';
import './Header.css';

interface OwnProps {}
interface StateProps {
    auth: AppConfig;
    panels: Panel[];
    panelFilters: PanelFilter[];
    responders: NetworkResponderMap;
    queryState: CohortStateType;
    queries: SavedQueriesState;
    user: UserContext;
}
interface DispatchProps {
    dispatch: Dispatch<any>;
    setCohortCountBoxState: (boxVisible: boolean, boxMinimized: boolean, infoButtonVisible: boolean) => void;
    startNewQuery: () => void;
}
type Props = StateProps & DispatchProps & OwnProps;

class Header extends React.PureComponent<Props> {
    public render() {
        const { user, responders } = this.props;
        const c = 'header';
        const resps: number[] = []; 
        const allowDisable = this.props.responders.size > 1;
        const username = user ? user.name : '';
        let totalActiveResponders = 0;
        responders.forEach((ni: NetworkIdentity) => { 
            if (!ni.isGateway) {
                resps.push(ni.id);
                if (ni.enabled) { totalActiveResponders += 1; }
            }
        });

        return (
            <Navbar id={`${c}-container`} className="d-flex justify-content-between mb-3">
                <div className={`${c}-content-side`}>
                    <div className={`${c}-title"`} >
                        <img alt="leaf-logo" className="logo" src={process.env.PUBLIC_URL + '/images/logos/apps/leaf.svg'} />
                        <div className="title">leaf</div>
                    </div>
                </div>
                <div className="mx-auto">
                    <CohortSummary />
                </div>
                <div className={`${c}-content-side ${c}-content-side-right`}>
                    <Nav className={`${c}-options`}>
                        <NavItem className={`${c}-new-query`} onClick={this.handleStartNewQueryClick}>
                            <div className={`${c}-option-container`}>
                                <FaPlus className={`${c}-options-icon ${c}-new-query-icon`}/>
                                <div className={`${c}-options-text ${c}-new-query`}>
                                    <span>New Query</span>
                                </div>
                            </div>
                        </NavItem>
                        <NavItem className={`${c}-networkhealth`}>
                            <div className={`${c}-networkhealth-text`}>
                                <div>
                                    <FaDatabase className={`${c}-options-icon ${c}-database-icon`}/>
                                </div>
                                <div>
                                    <span className={`${c}-options-text`}>Databases</span>
                                    <FaChevronDown className={`${c}-options-chevron`}/>
                                </div>
                            </div>
                            <div className={`${c}-option-container ${c}-networkhealth-container`}>
                                <div className={`${c}-networkhealth-inner`}>
                                    <div className={`${c}-networkhealth-description`}>
                                        <span>Clinical databases available to query</span>
                                    </div>
                                    {resps.map((id: number) => (
                                        <NetworkHealthResponder 
                                            allowDisable={allowDisable}
                                            key={id} 
                                            dispatch={this.props.dispatch} 
                                            identity={this.props.responders.get(id)!} 
                                            queryState={this.props.queryState}
                                            totalActiveResponders={totalActiveResponders}/>
                                    ))}
                                </div>
                            </div>
                        </NavItem>
                        <NavItem className={`${c}-myleaf`}>
                            <div className={`${c}-myleaf-icon-container`}>
                                <FiUser className={`${c}-options-icon ${c}-myleaf-icon`}/>
                                <span className={`${c}-options-text`}>{username}</span>
                                <FaChevronDown className={`${c}-options-chevron`}/>
                            </div>
                            <div className={`${c}-option-container ${c}-myleaf-container`}>
                                <div className={`${c}-myleaf-inner`}>

                                    {/* User Roles */}
                                    {user && user.roles.length > 0 &&
                                    <div className={`${c}-roles`}>

                                        {/* Admin */}
                                        {user.isAdmin &&
                                        <div className={`${c}-role`}>
                                            <FiShield className="myleaf-menu-icon header-role-icon-admin" />
                                            <span>Admin</span>
                                            <div className={`${c}-role-info`}>
                                                You are an administrator, which allows you to use the Admin Panel to the left.
                                            </div>
                                        </div>}

                                        {/* PHI */}
                                        {user.isPhiOkay &&
                                        <div className={`${c}-role`}>
                                            <FiUserCheck className="myleaf-menu-icon header-role-icon-phi" />
                                            <span>PHI</span>
                                            <div className={`${c}-role-info`}>
                                                You are able to see Protected Health Information by selecting Identified mode
                                                when you log in.
                                            </div>
                                        </div>}

                                        {/* Fed */}
                                        {user.isFederatedOkay &&
                                        <div className={`${c}-role`}>
                                            <FiGlobe className="myleaf-menu-icon header-role-icon-fed" />
                                            <span>Federated</span>
                                            <div className={`${c}-role-info`}>
                                                You are able to query other networked Leaf instances if these have been configured.
                                            </div>
                                        </div>}

                                        {/* Quarantined */}
                                        {!user.isFederatedOkay && resps.length > 1 &&
                                        <div className={`${c}-role`}>
                                            <FiAlertOctagon className="myleaf-menu-icon header-role-icon-quarantine" />
                                            <span>Local Only</span>
                                            <div className={`${c}-role-info`}>
                                                Other networked Leaf instances may be configured, but you are currently limited in access
                                                to only your home Leaf instance.
                                            </div>
                                        </div>}

                                    </div>}

                                    <div className={`${c}-myleaf-option`} onClick={this.handleMySavedQueriesClick}>
                                        <FaStar className="myleaf-menu-icon myleaf-menu-icon-savedqueries" />
                                        <span>My Saved Queries</span>
                                    </div>
                                    <div className="divider">
                                        <div />
                                    </div>
                                    <div className={`${c}-myleaf-option`} onClick={this.handleLogoutClick}>
                                        <FaDoorOpen className="myleaf-menu-icon myleaf-menu-icon-logout" />
                                        <span>Log Out</span>
                                    </div>
                                </div>
                            </div>
                        </NavItem>
                    </Nav>
                </div>
            </Navbar>
        );
    }

    /*
     * Handles 'Start New Query' clicks. If user has unsaved/changed query
     * in progress, handles workflow for saving and clearing UI.
     */
    private handleStartNewQueryClick = () => {
        const { queries, startNewQuery, dispatch, panels, queryState } = this.props;
        const confirm: ConfirmationModalState = {
            body: 'Do you want to save the current query?',
            header: 'Save Query',
            onClickNo: () => startNewQuery(),
            onClickYes: () => setTimeout(() => dispatch(toggleSaveQueryPane()), 500),
            show: true,
            noButtonText: 'No',
            yesButtonText: `Yes, I'll save first`
        };
        dispatch(setRunAfterSave(startNewQuery));

        // Check if query is running
        if (queryState === CohortStateType.REQUESTING) {
            dispatch(showInfoModal({ header: "Query Running", body: "Please wait until your current query has completed.", show: true }));
        }
        // Else if there are panel items but query is not saved
        else if (
            getPanelItemCount(panels) > 0 && 
            queryState === CohortStateType.LOADED &&
            !queries.current.id
        ) {
            dispatch(showConfirmationModal(confirm));
        }
        // Else if this is a saved query but definition has changed
        else if (
            queries.current.id &&
            queryState === CohortStateType.LOADED && 
            queries.currentChangeId !== queries.lastSavedChangeId
        ) {
            confirm.body = "Do you want to save changes to your current query?";
            dispatch(showConfirmationModal(confirm));
        }
        else {
            dispatch(setRunAfterSave(null));
            startNewQuery();
        }
    }

    /*
     * Handles 'Log out' clicks. Redirects browser to designated logout URI on confirmation.
     */
    private handleLogoutClick = () => {
        const { dispatch } = this.props;
        const confirm: ConfirmationModalState = {
            body: 'Are you sure you want to log out?',
            header: 'Log out',
            onClickNo: () => { return; },
            onClickYes: () => { dispatch(logout()); },
            show: true,
            noButtonText: 'No',
            yesButtonText: 'Yes, log me out'
        };
        dispatch(showConfirmationModal(confirm));
    };

    /*
     * Handles MySavedQueries click, opening the modal.
     */
    private handleMySavedQueriesClick = () => this.props.dispatch(toggleMyLeafModal())
}

const mapStateToProps = (state: AppState): StateProps => {
    return { 
        auth: state.auth.config!,
        panels: state.panels,
        panelFilters: state.panelFilters,
        queryState: state.cohort.count.state,
        responders: state.responders,
        queries: state.queries,
        user: state.auth.userContext!
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) : DispatchProps => {
    return { 
        dispatch,
        setCohortCountBoxState: (boxVisible: boolean, boxMinimized: boolean, infoButtonVisible: boolean) => {
            dispatch(setCohortCountBoxState(boxVisible, boxMinimized, infoButtonVisible))
        },
        startNewQuery: () => {
            dispatch(resetPanels());
            dispatch(setRoute(Routes.FindPatients));
            dispatch(setCurrentQuery({ name: '', category: '' }));
        }
    };
};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(Header);
