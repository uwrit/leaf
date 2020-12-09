/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { HelpPageCategory } from '../../../models/Help/HelpPages';
import './Category.css';

interface Props {
    category: HelpPageCategory;
}

interface State { }

export class Category extends React.Component<Props, State> {
    private className = "category"

    constructor(props: Props) {
        super(props);
        this.state = { }
    }

    public render() {
        const { category } = this.props;
        const c = this.className;

        return (
            <div className={c}>
                <b>{category.category.toUpperCase()}</b>
            </div>
        )
    }
}
