/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button } from 'reactstrap';
import { HelpPageCategory } from '../../../models/Help/Help';

interface Props {
    category: HelpPageCategory;
    numberOfPages: number;
}

interface State {
    show: boolean;
}

export class PagesButton extends React.Component<Props, State> {
    state = { show: false };

    public render() {
        const { numberOfPages } = this.props;
        const { show } = this.state;

        return (
            <Button color="link" onClick={this.handleSeeAllPagesClick}>
                {show
                    ? <span>Less ...</span>
                    : <span>See all {numberOfPages} pages</span>
                }
            </Button>
        );
    };

    private handleSeeAllPagesClick = () => {
        const { category } = this.props;

        this.setState({ show: !this.state.show })
        category.showAllCategoryPages = !this.state.show;
    };
};