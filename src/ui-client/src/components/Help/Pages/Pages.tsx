/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Col } from 'reactstrap';
import { fetchSingleHelpPageContent } from '../../../actions/helpPage';
import { HelpCategoryPageCache } from '../../../models/help/Help';
import { PartialHelpPage } from '../../../models/help/Help';
import './Pages.css';

interface Props {
    category: HelpCategoryPageCache;
    dispatch: any;
}

interface State {
    show: boolean;
}

export class Pages extends React.Component<Props, State> {
    private className = "pages"
    state = { show: false };

    public render() {
        const c = this.className;
        const { category } = this.props;
        const { show } = this.state;

        const pages = category.pages;
        const numberOfPages = pages.length;
        const numberOfPagesGreaterThanFive = (numberOfPages > 5) ? true : false;
        const start = 0;
        const defaultEnd = 5; // Maximum of 5 help pages will show by default.
        const end = show ? numberOfPages : defaultEnd;
        const slicedPages = pages.slice(start, end);

        return (
            <Col className={c} xs="4">
                <div className={`${c}-category`}>
                    <b>{category.name.toUpperCase()}</b>
                </div>

                {slicedPages.map(p =>
                    <div key={p.id} className={`${c}-page`}>
                        <Button color="link" onClick={this.handleHelpPageTitleClick.bind(null, p)}>
                            {p.title}
                        </Button>
                    </div>
                )}

                <div className={`${c}-show-all`}>
                    <Button color="link" onClick={this.handleSeeAllPagesClick}>
                        {numberOfPagesGreaterThanFive &&
                            (show
                                ? <span>Less ...</span>
                                : <span>See all {numberOfPages} pages</span>
                            )
                        }
                    </Button>
                </div>
            </Col>
        );
    };

    private handleHelpPageTitleClick = (page: PartialHelpPage) => {
        const { dispatch, category } = this.props;
        dispatch(fetchSingleHelpPageContent(page, category));
    };

    private handleSeeAllPagesClick = () => { this.setState({ show: !this.state.show }) };
};