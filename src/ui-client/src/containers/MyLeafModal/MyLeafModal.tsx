/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { Dispatch } from 'redux';
import { toggleMyLeafModal } from '../../actions/generalUi';
import SavedQueriesTable from '../../components/MyLeafModal/SavedQueriesTable';
import { AppState } from '../../models/state/AppState';
import { SavedQueriesState } from '../../models/Query';
import './MyLeafModal.css';
import { Panel } from '../../models/panel/Panel';
import { CohortStateType } from '../../models/state/CohortState';

interface StateProps {
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

class MyLeafModal extends React.PureComponent<Props> {
    private className = 'myleaf-modal';

    constructor(props: Props) {
        super(props);
    }

    public render() {
        const c = this.className;
        const classes = [ c, 'leaf-modal' ];
        const { queries, dispatch, panels, queryState } = this.props;

        return (
            <Modal isOpen={this.props.show} className={classes.join(' ')} keyboard={true}>
                <ModalHeader>
                    My Leaf
                    <span className={`${c}-close`} onClick={this.handleCloseClick}>✖</span>
                </ModalHeader>
                <div className={`${c}-tab-container`}>
                <Nav tabs={true}>
                        <NavItem>
                            <NavLink active={true}>
                                My Saved Queries
                            </NavLink>
                        </NavItem>
                    </Nav>
                </div>
                <ModalBody>
                    <TabContent activeTab="1">
                        <TabPane tabId="1">
                            <SavedQueriesTable dispatch={dispatch} panels={panels} queries={queries} queryState={queryState}/>
                        </TabPane>
                    </TabContent>
                </ModalBody>
                <ModalFooter>
                    <Button className="leaf-button leaf-button-primary" onClick={this.handleCloseClick}>Close</Button>
                </ModalFooter>
            </Modal>
        );
    }

    private handleCloseClick = () => this.props.dispatch(toggleMyLeafModal());
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
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