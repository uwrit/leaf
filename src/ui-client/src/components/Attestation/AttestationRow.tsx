/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';

interface Props {
    className?: string;
}

interface State {
    hidden: boolean;
}


export default class AttestationRow extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hidden: true
        }
    };

    public componentDidMount() {
        setTimeout(() => this.setState({ hidden: false }), 10);
    }

    public render() {
        const c = `attestation-row ${this.props.className ? this.props.className : ''}`
        const classes = [ c, (this.state.hidden ? 'hidden' : '') ];

        return  (
            <div className={classes.join(' ')}>
                {this.props.children}
            </div>
        )
    }
}