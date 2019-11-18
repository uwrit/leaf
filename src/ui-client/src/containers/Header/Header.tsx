/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux'
import { Navbar, Nav } from 'reactstrap';
import { setCohortCountBoxState, toggleSaveQueryPane, setRoute, showConfirmationModal, toggleMyLeafModal, showInfoModal, setMyLeafTab } from '../../actions/generalUi';
import { resetPanels } from '../../actions/panels';
import { AppState } from '../../models/state/AppState';
import { UserContext, AppConfig } from '../../models/Auth';
import { CohortStateType } from '../../models/state/CohortState';
import { NetworkResponderMap } from '../../models/NetworkResponder';
import { Panel } from '../../models/panel/Panel';
import CohortSummary from './CohortSummary';
import { Routes, ConfirmationModalState, MyLeafTabType } from '../../models/state/GeneralUiState';
import { SavedQueriesState } from '../../models/Query';
import { setCurrentQuery, setRunAfterSave } from '../../actions/queries';
import { PanelFilter } from '../../models/panel/PanelFilter';
import { getPanelItemCount } from '../../utils/panelUtils';
import { logout } from '../../actions/session';
import NewQueryButton from '../../components/Header/NewQueryButton';
import DatabasesButton from '../../components/Header/DatabasesButton';
import UserButton from '../../components/Header/UserButton';
import ImportButton from '../../components/Header/ImportButton';
import ImportState from '../../models/state/Import';
import './Header.css';

interface OwnProps {}
interface StateProps {
    auth: AppConfig;
    importState: ImportState;
    panels: Panel[];
    panelFilters: PanelFilter[];
    responders: NetworkResponderMap;
    queryState: CohortStateType;
    queries: SavedQueriesState;
    user: UserContext;
}
interface DispatchProps {
    dispatch: any;
    setCohortCountBoxState: (boxVisible: boolean, boxMinimized: boolean, infoButtonVisible: boolean) => void;
    startNewQuery: () => void;
}
type Props = StateProps & DispatchProps & OwnProps;

class Header extends React.PureComponent<Props> {
    public render() {
        const { user, responders, dispatch, queryState, importState } = this.props;
        const c = 'header';

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
                        
                        {/* New Query */}
                        <NewQueryButton 
                            startNewQueryClickHandler={this.handleStartNewQueryClick} 
                        />

                        {/* Databases */}
                        <DatabasesButton 
                            dispatch={dispatch} 
                            responders={responders} 
                            queryState={queryState} 
                        />

                        {/* Import */}
                        {importState.enabled &&
                        <ImportButton dispatch={dispatch} importOptions={importState} />
                        }

                        {/* User */}
                        <UserButton 
                            federated={responders.size > 1}
                            imports={importState}
                            logoutClickHandler={this.handleLogoutClick} 
                            myLeafModalToggleHandler={this.handleMyleafModalToggleClick}
                            user={user} 
                        />

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
     * Handles MyLeafmodal toggle click, opening the modal and setting the appropriate tab.
     */
    private handleMyleafModalToggleClick = (tab: MyLeafTabType) => {
        const { dispatch } = this.props;
        dispatch(setMyLeafTab(tab));
        dispatch(toggleMyLeafModal());
    }
}

const mapStateToProps = (state: AppState): StateProps => {
    return { 
        auth: state.auth.config!,
        importState: state.dataImport,
        panels: state.panels,
        panelFilters: state.panelFilters,
        queryState: state.cohort.count.state,
        responders: state.responders,
        queries: state.queries,
        user: state.auth.userContext!
    };
};

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps) : DispatchProps => {
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
