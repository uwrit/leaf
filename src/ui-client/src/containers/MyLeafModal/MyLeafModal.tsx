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
import { toggleMyLeafModal } from '../../actions/generalUi';
import SavedQueriesTable from '../../components/MyLeafModal/SavedQueriesTable/SavedQueriesTable';
import { AppState } from '../../models/state/AppState';
import { SavedQueriesState } from '../../models/Query';
import { Panel } from '../../models/panel/Panel';
import { CohortStateType } from '../../models/state/CohortState';
import { NetworkIdentity } from '../../models/NetworkResponder';
import './MyLeafModal.css';
import REDCapImportsTable from '../../components/MyLeafModal/REDCapImportsTable/REDCapImportsTable';
import { ImportMetadata, ImportType } from '../../models/dataImport/ImportMetadata';

interface StateProps {
    home?: NetworkIdentity;
    imports: Map<string, ImportMetadata>;
    queryState: CohortStateType;
    panels: Panel[];
    queries: SavedQueriesState;
    show: boolean;
}
interface DispatchProps {
    dispatch: Dispatch<any>
}
interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
    activeTab: string;
}

class MyLeafModal extends React.PureComponent<Props, State> {
    private className = 'myleaf-modal';

    constructor(props: Props) {
        super(props);
        this.state = {
            activeTab: '1'
        };
    }

    public render() {
        const c = this.className;
        const classes = [ c, 'leaf-modal' ];
        const { queries, dispatch, panels, queryState, home, imports } = this.props;
        const { activeTab } = this.state;
        const isGateway = home ? home.isGateway : false;
        const redcap = [ ...imports.values() ].filter(im => im.type === ImportType.REDCapProject);

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
                            <NavLink active={activeTab === '1'} onClick={this.handleTabClick.bind(null, '1')}>
                                My Saved Queries
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink active={activeTab === '2'} onClick={this.handleTabClick.bind(null, '2')}>
                                My REDCap Imports
                            </NavLink>
                        </NavItem>
                    </Nav>
                </div>

                {/* Body */}
                <ModalBody>
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                            <SavedQueriesTable dispatch={dispatch} panels={panels} queries={queries} queryState={queryState} isGateway={isGateway}/>
                        </TabPane>
                        <TabPane tabId="2">
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

    private handleTabClick = (id: string) => {
        this.setState({ activeTab: id });
    }
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        home: state.responders.get(0),
        imports: state.dataImport.imports,
        queryState: state.cohort.count.state,
        panels: state.panels,
        queries: state.queries,
        show: state.generalUi.showMyLeafModal
    };
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyLeafModal);