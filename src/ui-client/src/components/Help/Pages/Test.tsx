/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Col } from 'reactstrap';
import { HelpPageCategory } from '../../../models/Help/Help';

interface Props {
    category: HelpPageCategory;
}

interface State {
    show: boolean;
}

export class Test extends React.Component<Props, State> {
    state = { show: false };

    public render() {
        const { show } = this.state;

        return (
            <Col xs="4">
                <div>
                    <Button color="link" onClick={this.handleSeeAllPagesClick}>
                        {show
                            ? <span>Less ...</span>
                            : <span>See all 10 pages</span>
                        }
                    </Button>
                </div>
            </Col>
        );
    };

    private handleSeeAllPagesClick = () => {
        const { category } = this.props;

        this.setState({ show: !this.state.show })
        category.showAllCategoryPages = !this.state.show;
    };
};