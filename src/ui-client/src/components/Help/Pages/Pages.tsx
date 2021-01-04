/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Col } from 'reactstrap';
import { fetchSingleHelpPageContent, resetHelpPageContent } from '../../../actions/help/helpPageContent';
import { HelpPageCategory } from '../../../models/Help/Help';
import { HelpPage } from '../../../models/Help/Help';
import './Pages.css';


interface Props {
    category: HelpPageCategory;
    dispatch: any;
    handleHelpPageClick: (pageTitle: string) => any;
    pages: HelpPage[];
}

interface State {
    show: boolean;
}

export class Pages extends React.Component<Props, State> {
    private className = "pages"
    state = { show: false };

    public render() {
        const c = this.className;
        const { category, pages } = this.props;
        const { show } = this.state;

        const numberOfPages = pages.length;
        const start = 0;
        const defaultEnd = 5; // Maximum of 5 help pages will show by default.
        const end = category.showAllCategoryPages ? numberOfPages : defaultEnd;
        const slicedPages = pages.slice(start, end);

        return (
            <Col className={c} xs="4">
                <div>
                    <strong>{category.category.toUpperCase()}</strong>
                </div>

                {slicedPages.map(p =>
                    <div key={p.id} className={`${c}-page`}>
                        <Button color="link" onClick={() => this.handleHelpPageTitleClick(p)}>
                            {p.title}
                        </Button>
                    </div>
                )}

                <div className={`${c}-all`}>
                    <Button color="link" onClick={this.handleSeeAllPagesClick}>
                        {show
                            ? <span>Less ...</span>
                            : <span>See all {numberOfPages} pages</span>
                        }
                    </Button>
                </div>
            </Col>
        );
    };

    private handleHelpPageTitleClick = (page: HelpPage) => {
        const { dispatch, handleHelpPageClick } = this.props;

        // dispatch(resetHelpPageContent());
        dispatch(fetchSingleHelpPageContent(page.id));

        handleHelpPageClick(page.title);
    };

    private handleSeeAllPagesClick = () => {
        const { category } = this.props;

        this.setState({ show: !this.state.show })
        category.showAllCategoryPages = !this.state.show;
    };
};