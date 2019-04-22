/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { FaDoorOpen, FaStar } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { Dispatch } from 'redux';
import { connect } from 'react-redux'
import { Navbar } from 'reactstrap';
import { Nav, NavItem } from 'reactstrap';
import { setCohortCountBoxState, toggleSaveQueryPane, setRoute, showConfirmationModal, toggleMyLeafModal, showInfoModal } from '../../actions/generalUi';
import { resetPanels } from '../../actions/panels';
import NetworkHealthRespondent from '../../components/Header/NetworkHealthRespondent/NetworkHealthRespondent';
import { AppState } from '../../models/state/AppState';
import { UserContext, AuthConfig } from '../../models/Auth';
import { CohortStateType } from '../../models/state/CohortState';
import { NetworkIdentity, NetworkRespondentMap } from '../../models/NetworkRespondent';
import { Panel } from '../../models/panel/Panel';
import CohortSummary from './CohortSummary';
import { Routes, ConfirmationModalState } from '../../models/state/GeneralUiState';
import { SavedQueriesState } from '../../models/Query';
import { setCurrentQuery, setRunAfterSave } from '../../actions/queries';
import { PanelFilter } from '../../models/panel/PanelFilter';
import { getPanelItemCount } from '../../utils/panelUtils';
import { FaDatabase, FaChevronDown } from 'react-icons/fa';
import './Header.css';
import { logout } from '../../actions/session';

interface OwnProps {}
interface StateProps {
    auth: AuthConfig;
    panels: Panel[];
    panelFilters: PanelFilter[];
    respondents: NetworkRespondentMap;
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
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { user } = this.props;
        const c = 'header';
        const resps: number[] = []; 
        const allowDisable = this.props.respondents.size > 1;
        const username = user ? user.name : '';
        let totalActiveRespondents = 0;
        this.props.respondents.forEach((ni: NetworkIdentity) => { 
            resps.push(ni.id);
            if (ni.enabled) { totalActiveRespondents += 1; }
        });

        return (
            <Navbar id={`${c}-container`} className="d-flex justify-content-between mb-3">
                <div className={`${c}-content-side`}>
                    <div className={`${c}-title"`} >
                        <img className="logo" src={process.env.PUBLIC_URL + '/images/logos/apps/leaf.svg'} />
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
                                        <NetworkHealthRespondent 
                                            allowDisable={allowDisable}
                                            key={id} 
                                            dispatch={this.props.dispatch} 
                                            identity={this.props.respondents.get(id)!} 
                                            queryState={this.props.queryState}
                                            totalActiveRespondents={totalActiveRespondents}/>
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
        const { dispatch, auth } = this.props;
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
        respondents: state.respondents,
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
