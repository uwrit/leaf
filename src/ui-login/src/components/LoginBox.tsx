/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import { FiLock, FiChevronRight } from 'react-icons/fi';
import './LoginBox.css';
import { LoginState } from '../App';

interface Props {
    handleClick: () => any;
    handlePassChange: (pass: string) => any;
    handleUsernameChange: (username: string) => any;
    loginState: LoginState;
    pass: string;
    username: string;
}

interface State {
    passValid: boolean;
    usernameValid: boolean;
}

export default class LoginBox extends React.PureComponent<Props,State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            passValid: true,
            usernameValid: true
        }
    }

    public render() {
        const c = 'loginbox';
        const { loginState, pass, username } = this.props;
        const { passValid, usernameValid } = this.state;
        const classes = [ c, (loginState === LoginState.FailedLogin ? 'invalid' : '') ];
        const buttonClasses = [ `${c}-button`, (loginState === LoginState.CallingServer ? 'calling' : '') ];
        const passClasses = [ 'leaf-input' ];
        const usernameClasses = [ 'leaf-input' ];
        let passPlaceholder = '';
        let usernamePlaceholder = '';

        if (!passValid) {
            passClasses.push('error');
            passPlaceholder = 'Enter password';
        }
        if (!usernameValid) {
            usernameClasses.push('error');
            usernamePlaceholder = 'Enter username';
        }

        return (
            <Form className={classes.join(' ')}> 
                <FormGroup className={`${c}-form-group`}>
                    <Label for="username">Username</Label>
                    <Input className={usernameClasses.join(' ')} type="text" name="address" id="username" 
                           autoFocus={true} placeholder={usernamePlaceholder} value={username} 
                           onChange={this.handleUsernameChange} autoComplete="off" onKeyPress={this.handleKeypress} />
                    <FiLock className="lock" />
                </FormGroup>
                <FormGroup className={`${c}-form-group`}>
                    <Label for="pass">Password</Label>
                    <Input className={passClasses.join(' ')} type="password" name="address2" id="pass" 
                           onKeyPress={this.handleKeypress} placeholder={passPlaceholder}
                           value={pass} onChange={this.handlePassChange} />
                    <FiLock className="lock" />
                </FormGroup>
                <div className={buttonClasses.join(' ')} tabIndex={3} onClick={this.handleClick}>
                    {this.getSignInContent()}
                </div>
            </Form>
        );
    }

    private handleClick = () => {
        const { username, pass, handleClick } = this.props;
        const usernameValid = !!username.length;
        const passValid = !!pass.length;

        this.setState({ usernameValid, passValid });
        if (usernameValid && passValid) {
            handleClick();
        }
    }

    private getSignInContent = () => {
        const { loginState } = this.props;

        if (loginState === LoginState.CallingServer) { return <span>{this.generateLoginText()}</span>; }
        else { return ([<span key={1}>Sign in</span>, <FiChevronRight key={2} className="icon chevron" />]); }
    }

    private handleKeypress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            this.handleClick();
        }
    }

    private handleUsernameChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newuser = e.currentTarget.value;
        this.props.handleUsernameChange(newuser);
        if (!this.state.usernameValid) {
            this.setState({ usernameValid: true });
        }
    }

    private handlePassChange = (e: React.FormEvent<HTMLInputElement>) => {
        const newpass = e.currentTarget.value;
        this.props.handlePassChange(newpass);
        if (!this.state.passValid) {
            this.setState({ passValid: true });
        }
    }

    private generateLoginText = (): string => {
        const seed = +(Math.random() * 10).toFixed();

        switch (seed) {
            case 1: case 2: return "Calling the mother ship...";
            case 3: case 4: return "Phoning home...";
            case 5: case 6: return "Verifying access...";
            case 7: case 8: return "Beaming up login info...";
            case 9: case 10: return "Trusting but verifying...";
            default: return "Logging in...";
        }
    }
}