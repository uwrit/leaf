/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';

interface Props {}

interface State {
    hidden: boolean;
}

export default class REDCapImportSection extends React.PureComponent<Props, State> {
    private className = 'import-redcap-section';

    constructor(props: Props) {
        super(props);
        this.state = {
            hidden: true
        };
    }

    public componentDidMount() {
        setTimeout(() => this.setState({ hidden: false }), 10);
    }

    public render() {
        const c = this.className;
        const classes = [ c, (this.state.hidden ? 'hidden' : '') ];

        return (
            <div className={classes.join(' ')}>
                {this.props.children}
            </div>
        );
    }
};