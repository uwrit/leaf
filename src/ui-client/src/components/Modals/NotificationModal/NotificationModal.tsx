/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Container } from 'reactstrap';
import { setUserNotificationsSeen } from '../../../actions/auth';
import { AppState } from '../../../models/state/AppState';
import CheckboxSlider from '../../Other/CheckboxSlider/CheckboxSlider';
import { ServerState } from '../../../models/state/ServerState';
import './NotificationModal.css';

interface OwnProps {
    dispatch: any;
}
interface DispatchProps {
}
interface StateProps {
    hasAttested: boolean;
    serverState: ServerState;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
    checked: boolean;
    currentIdx: number;
}

class NotificationModal extends React.PureComponent<Props, State> {
    private className = 'notification-modal';
    constructor(props: Props) {
        super(props);
        this.state = {
            checked: true,
            currentIdx: 0
        }
    }

    public render() {
        const { hasAttested, serverState } = this.props;
        const { checked, currentIdx } = this.state;
        const c = this.className;
        const classes = [ c ];
        const show = hasAttested && serverState.notifications.length > 0;
        const total = serverState.notifications.length;
        let text = "";

        if (currentIdx < total) {
            text = serverState.notifications[currentIdx].message;
        }

        if (show) {
            classes.push('show');
        }

        return (
            <div className={classes.join(' ')}> 
                <div className={`${c}-header`}>

                    {/* Notification count in corner */}
                    {show &&
                    <div className={`${c}-count`}>
                        <span className={`${c}-count-num`}>{currentIdx+1}/{total}</span>
                        <span className={`${c}-count-text`}> messages</span>
                    </div>           
                    }
                </div>
                <div className={`${c}-body`}>

                    {/* Message content */}
                    <div className={`${c}-text`}>
                        <textarea value={text} spellCheck={false} readOnly={true}/>
                    </div>
                </div>
                <div className={`${c}-footer`}>

                    {/* Footer stuff */}
                    <Container fluid={true}>
                        <Row>
                            <Col md={1} className={`${c}-checkbox`}>
                                <CheckboxSlider checked={checked} onClick={this.handleCheckboxClick} />
                            </Col>
                            <Col md={8} className={`${c}-dontshow`}>
                                <span>Don't show me again</span>
                            </Col>
                            <Col md={3}>
                                <Button className={'leaf-button leaf-button-primary'} onClick={this.handleClickOkay}>Okay</Button>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }

    private handleCheckboxClick = () => {
        this.setState({ checked: !this.state.checked });
    }

    private handleClickOkay = () => {
        const { dispatch, serverState } = this.props;
        const { currentIdx, checked } = this.state;

        if (currentIdx + 1 == serverState.notifications.length) {
            dispatch(setUserNotificationsSeen(checked));
            this.setState({ currentIdx: 0 });
        } else {
            this.setState({ currentIdx: currentIdx + 1 });
        }
    }
}

const mapStateToProps = (state: AppState) => {
    return {
        hasAttested: state.session.hasAttested,
        serverState: state.auth.serverState
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    };
};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(NotificationModal);
