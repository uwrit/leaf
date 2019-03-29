/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React, { Component } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { login } from './services/api';
import LoginBox from './components/LoginBox';
import InfoBox from './components/InfoBox';
import LeftFooter from './components/LeftFooter';
import RightFooter from './components/RightFooter';
import { IdTokenDTO } from './models/IdTokenDTO';

interface Props { }

interface State {
    loginState: LoginState;
    pass: string;
    username: string;
}

export enum LoginState {
    Idle = 1,
    CallingServer = 2,
    FailedLogin = 3
}

export default class App extends Component<Props,State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loginState: LoginState.Idle,
            pass: '',
            username: ''
        }
    }

    public componentDidUpdate() { return null; }

    public getSnapshotBeforeUpdate(prevProps: Props, prevState: State) {
        if (prevState.loginState === LoginState.CallingServer && this.state.loginState === LoginState.FailedLogin) {
            setTimeout(() => this.setState({ loginState: LoginState.Idle }), 500);
        }
        return null;
    }

    public render() {
        const { loginState, pass, username} = this.state;
        return (
            <div className="app">
                <Container fluid={true}>
                    <Row>
                        <Col className="col-left">
                            <div className="col-left-container">
                                <InfoBox />
                                <LeftFooter />
                            </div>
                        </Col>
                        <Col className="col-right">
                            <div className="col-right-container">
                                <div className="leaf-logo-wrapper">
                                    <img className="leaf-logo" src={process.env.PUBLIC_URL + '/leaf_logo.svg'} />
                                    <div className="leaf-logo-title">leaf</div>
                                </div>
                                <LoginBox 
                                    handleClick={this.handleClickSignIn}
                                    handlePassChange={this.handlePassChange}
                                    handleUsernameChange={this.handleUsernameChange}
                                    loginState={loginState}
                                    pass={pass}
                                    username={username}
                                />
                            </div>
                            <RightFooter />
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }

    private handleUsernameChange = (username: string) => this.setState({ username });

    private handlePassChange = (pass: string) => this.setState({ pass });

    private handleClickSignIn = async () => {
        if (this.state.loginState !== LoginState.Idle) { return; }
        this.setState({ loginState: LoginState.CallingServer });

        const { username, pass } = this.state;

        // Fake a login attempt for ui testing
        await this.sleep(1500);
        this.setState(
            { loginState: LoginState.FailedLogin }, 
            () => setTimeout(() => this.setState({ loginState: LoginState.Idle }), 500)
        );

        /*
        try {
            const token: IdTokenDTO = await login(username, pass);

            // DO SOMETHING WITH ID TOKEN HERE ???
            const path = window.location.origin;
            window.location.replace(path);

        } catch (err) {
            console.log(err);
            this.setState(
                { loginState: LoginState.FailedLogin }, 
                () => setTimeout(() => this.setState({ loginState: LoginState.Idle }), 500)
            );
        }
        */
    };

    private sleep = (milliseconds: number) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
};
