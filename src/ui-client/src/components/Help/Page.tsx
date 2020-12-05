/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { HelpPages } from '../../models/Help/HelpPages';
import './Page.css';

interface Props {
    page: HelpPages;
}

interface State { }

export class Page extends React.Component<Props, State> {
    private className = "page";

    constructor(props: Props) {
        super(props);
        this.state = { }
    }

    public render() {
        const { page } = this.props;
        const c = this.className;

        return (
            <div className={c}>
                <a href="#" onClick={this.handleClick}>
                    {page.title.toUpperCase()}
                </a>
            </div>
        )
    }

    private handleClick = () => {
        const { page } = this.props;

        return alert(page.title)
    }
}
