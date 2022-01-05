/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import moment from 'moment';
import React from 'react';

import { connect } from 'react-redux';
import { getIdToken } from '../actions/auth';
import { attestAndLoadSession, refreshSession } from '../actions/session';
import { AppState } from '../models/state/AppState';
import { SessionContext } from '../models/Session';
import { version } from '../../package.json'
import { Navigate, Route, Routes } from 'react-router-dom';
import Patient from './Patient/Patient';
import { history } from '../store/configureStore';
import Header from './Header/Header';
import Cohort from './Cohort/Cohort';
import './App.css';

interface OwnProps {
}
interface DispatchProps {
    dispatch: any;
}
interface StateProps {
    state: AppState
}

type Props = StateProps & DispatchProps & OwnProps;
let inactivityTimer: NodeJS.Timer;
let sessionTimer: NodeJS.Timer;

class App extends React.Component<Props> {
    private sessionTokenRefreshPaddingMinutes = 2;
    private heartbeatCheckIntervalSeconds = 10;
    private lastHeartbeat = new Date();
    private hasAttested = false;
    private unlisten: any;

    public componentDidMount() {
        const { dispatch } = this.props;
        this.handleBrowserHeartbeat();
        dispatch(getIdToken());
        console.info(`Leaf client application running version ${version}`);

        this.unlisten = history.listen(({ action, location }) => {
            console.log("on route change", action, location);
        });
    }

    public componentDidUpdate() { 
        const { dispatch, state } = this.props;
        const { auth } = state;
        if (!this.hasAttested && auth && auth.userContext) {
            const dummyAttest = {
                documentation: { institution: '', title: '' },
                isIdentified: true,
                sessionType: 1
            };
            dispatch(attestAndLoadSession(dummyAttest));
            this.hasAttested = true;
        }
    }

    public getSnapshotBeforeUpdate(nextProps: Props): any {
        const { state } = nextProps;
        const { session } = state;
        if (session.context) {
            this.handleSessionTokenRefresh(session.context);
        }
        return null;
    }

    public render() {
        const { dispatch, state } = this.props;
        const { auth, config, session } = state;
        const classes = [ 'app-container' ];

        return (
            <div className={classes.join(' ')} onMouseDown={this.handleActivity} onKeyDown={this.handleActivity}>
                <Header dashboardName={state.config.main.title} />
                {session && session.context &&
                <div id="main-content">
                    <Routes>
                        <Route path="/:dashboardId" element={<Cohort cohort={state.cohort} config={config.main} />} />
                        <Route path="/:dashboardId/patients/:patientId" element={<Patient cohort={state.cohort} config={config.patient} />} />
                        <Route path="*" element={<Navigate to="/test" />} />
                    </Routes>
                </div>
                }
            </div>
        );
    }

    /*
     * Poll at short intervals to test that browser is active.
     * If the gap between 2 heartbeats is greater than twice
     * the polling interval, the browser was likely asleep, so
     * try to refresh the session.
     */
    private handleBrowserHeartbeat = () => {
        const { dispatch } = this.props;
        const now = new Date();
        const diffSeconds = (now.getTime() - this.lastHeartbeat.getTime()) / 1000;

        if (diffSeconds > (this.heartbeatCheckIntervalSeconds * 2)) {
            dispatch(refreshSession());
        }
        setTimeout(this.handleBrowserHeartbeat, this.heartbeatCheckIntervalSeconds * 1000);
        this.lastHeartbeat = now;
    }

    /*
     * Refresh user session token (should be short interval, e.g., 4 minutes).
     */
    private handleSessionTokenRefresh(ctx: SessionContext) {
        const { dispatch } = this.props;
        const refreshDtTm = moment(ctx.expirationDate).add(-this.sessionTokenRefreshPaddingMinutes, 'minute').toDate();
        const diffMs = refreshDtTm.getTime() - new Date().getTime();
        const timeoutMs = diffMs < 0 ? 0 : diffMs;

        if (sessionTimer) {
            clearTimeout(sessionTimer);
        }
        sessionTimer = setTimeout(() => {
            dispatch(refreshSession());
        }, timeoutMs);
    }

    /*
     * Handle user activity via mouse or key action, which resets the inactivity timeout.
     */
    private handleActivity = () => {
        const { dispatch, state } = this.props;
        const { auth, session } = state;
        if (!session.context || auth!.config!.authentication.inactivityTimeoutMinutes <= 0) { return; }

        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
    }
}

const mapStateToProps = (state: AppState) => {
    return { state };
};

const mapDispatchToProps = (dispatch: any) => {
    return { dispatch };
};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(App);
