/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
import { ImportMetadata, ImportType } from '../../models/dataImport/ImportMetadata';
import { MyLeafTabType } from '../../models/state/GeneralUiState';
import { FaStar } from 'react-icons/fa';
import { toggleImportRedcapModal } from '../../actions/dataImport';
import ImportState from '../../models/state/Import';
import './MyLeafModal.css';

interface StateProps {
    home?: NetworkIdentity;
    imports: ImportState;
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
        const { queries, dispatch, panels, queryState, home, imports, tab } = this.props;
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
                        {imports.redCap.enabled && 
                        <NavItem>
                            <NavLink active={tab === MyLeafTabType.REDCapImport} onClick={this.handleTabClick.bind(null, MyLeafTabType.REDCapImport)}>
                                <img alt='redcap-logo' className='header-icon-redcap' src={`${process.env.PUBLIC_URL}/images/logos/apps/redcap.png`}/>
                                My REDCap Imports
                            </NavLink>
                        </NavItem>
                        }
                    </Nav>

                    {tab === MyLeafTabType.REDCapImport &&
                    <Button className='leaf-button leaf-button-addnew' onClick={this.handleImportREDCapProjectClick}>
                        + Import REDCap Project
                    </Button>}

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
                    </TabContent>
                </ModalBody>

                {/* Footer */}
                <ModalFooter>
                    <Button className="leaf-button leaf-button-primary" onClick={this.handleCloseClick}>Close</Button>
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
        home: state.responders.get(0),
        imports: state.dataImport,
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