/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { Dispatch } from 'redux';
import { toggleMyLeafModal, setMyLeafTab } from '../../actions/generalUi';
import SavedQueriesTable from '../../components/MyLeafModal/SavedQueriesTable/SavedQueriesTable';
import { AppState } from '../../models/state/AppState';
import { SavedQueriesState } from '../../models/Query';
import { Panel } from '../../models/panel/Panel';
import { CohortStateType } from '../../models/state/CohortState';
import { NetworkIdentity } from '../../models/NetworkResponder';
import REDCapImportsTable from '../../components/MyLeafModal/REDCapImportsTable/REDCapImportsTable';
import { ImportType } from '../../models/dataImport/ImportMetadata';
import { MyLeafTabType } from '../../models/state/GeneralUiState';
import { FaStar } from 'react-icons/fa';
import { toggleImportRedcapModal } from '../../actions/dataImport';
import ImportState from '../../models/state/Import';
import UserQueriesTable from '../../components/MyLeafModal/UserQueriesTable/UserQueriesTable';
import AdminState from '../../models/state/AdminState';
import UserSearchBox from '../../components/MyLeafModal/UserQueriesTable/UserSearchBox';
import { FiUsers } from 'react-icons/fi';
import './MyLeafModal.css';

interface StateProps {
    adminState?: AdminState;
    home?: NetworkIdentity;
    imports: ImportState;
    isAdmin: boolean;
    queryState: CohortStateType;
    panels: Panel[];
    queries: SavedQueriesState;
    show: boolean;
    tab: MyLeafTabType
}
interface DispatchProps {
    dispatch: Dispatch<any>
}
interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

class MyLeafModal extends React.PureComponent<Props> {
    private className = 'myleaf-modal';

    public render() {
        const c = this.className;
        const classes = [ c, 'leaf-modal' ];
        const { queries, dispatch, panels, queryState, home, imports, tab, isAdmin, adminState } = this.props;
        const isGateway = home ? home.isGateway : false;
        const redcap = [ ...imports.imports.values() ].filter(im => im.type === ImportType.REDCapProject);

        return (
            <Modal isOpen={this.props.show} className={classes.join(' ')} keyboard={true}>

                {/* Header */}
                <ModalHeader>
                    My Leaf <span className={`${c}-close`} onClick={this.handleCloseClick}>✖</span>
                </ModalHeader>

                {/* Tabs */}
                <div className={`${c}-tab-container`}>
                    <Nav tabs={true}>
                        <NavItem>
                            <NavLink active={tab === MyLeafTabType.SavedQueries} onClick={this.handleTabClick.bind(null, MyLeafTabType.SavedQueries)}>
                                <FaStar className="myleaf-menu-icon myleaf-menu-icon-savedqueries" />
                                My Saved Queries
                            </NavLink>
                        </NavItem>
                        {isAdmin && adminState &&
                        <NavItem>
                            <NavLink active={tab === MyLeafTabType.AdminUserQuery} onClick={this.handleTabClick.bind(null, MyLeafTabType.AdminUserQuery)}>
                                <FiUsers className="myleaf-menu-icon myleaf-menu-icon-usersavedqueries" />
                                User Saved Queries
                            </NavLink>
                        </NavItem>
                        }
                        {imports.redCap.enabled && 
                        <NavItem>
                            <NavLink active={tab === MyLeafTabType.REDCapImport} onClick={this.handleTabClick.bind(null, MyLeafTabType.REDCapImport)}>
                                <img alt='redcap-logo' className='header-icon-redcap' src={`${process.env.PUBLIC_URL}/images/logos/apps/redcap.png`}/>
                                My REDCap Imports
                            </NavLink>
                        </NavItem>
                        }
                    </Nav>

                </div>

                {/* Body */}
                <ModalBody>
                    <TabContent activeTab={tab}>
                        <TabPane tabId={MyLeafTabType.SavedQueries}>
                            <SavedQueriesTable dispatch={dispatch} panels={panels} queries={queries} queryState={queryState} isGateway={isGateway}/>
                        </TabPane>
                        <TabPane tabId={MyLeafTabType.REDCapImport}>
                            <REDCapImportsTable dispatch={dispatch} imports={redcap} />
                        </TabPane>
                        <TabPane tabId={MyLeafTabType.AdminUserQuery}>
                            <UserSearchBox dispatch={dispatch} userQueryState={adminState!.userQueries} />
                            <UserQueriesTable dispatch={dispatch} panels={panels} savedQueryState={queries} queryState={queryState} userQueryState={adminState!.userQueries} />
                        </TabPane>
                    </TabContent>
                </ModalBody>

                {/* Footer */}
                <ModalFooter>
                    <Button className="leaf-button leaf-button-primary" onClick={this.handleCloseClick}>Close</Button>
                    {tab === MyLeafTabType.REDCapImport &&
                    <Button className='leaf-button leaf-button-addnew' onClick={this.handleImportREDCapProjectClick}>
                        + Import REDCap Project
                    </Button>
                    }
                </ModalFooter>
            </Modal>
        );
    }

    private handleCloseClick = () => this.props.dispatch(toggleMyLeafModal());

    private handleTabClick = (tab: MyLeafTabType) => {
        const { dispatch } = this.props;
        dispatch(setMyLeafTab(tab));
    }

    private handleImportREDCapProjectClick = () => {
        const { dispatch } = this.props;
        dispatch(toggleMyLeafModal());
        dispatch(toggleImportRedcapModal());
    }
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        adminState: state.admin,
        home: state.responders.get(0),
        imports: state.dataImport,
        isAdmin: state.auth.userContext!.isAdmin,
        queryState: state.cohort.count.state,
        panels: state.panels,
        queries: state.queries,
        show: state.generalUi.showMyLeafModal,
        tab: state.generalUi.currentMyLeafTab
    };
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyLeafModal);