/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Row } from 'reactstrap';
import { HelpPageDTO, HelpPageCategory, HelpPageMap } from '../../../models/Help/Help';
import { Category } from '../Category/Category';
import { Page } from '../Page/Page';
import { PagesButton } from './PagesButton';
import './Pages.css';

interface Props {
    categories: HelpPageCategory[];
    dispatch: any;
    handleHelpPageClick: (pageTitle: string) => any;
    pages: HelpPageMap;
}

export class Pages extends React.Component<Props> {
    private className = "pages";

    public render() {
        const c = this.className;
        const { categories, dispatch, handleHelpPageClick, pages } = this.props;
        
        return (
            <Row className={c}>
                {categories.map((c, i) =>
                    (pages.has(c.id) &&
                        <div key={i}>
                            <Col>
                                <Category key={c.id} category={c.category} />
                            </Col>

                            <Col>
                                {this.getPages(c).map(p =>
                                    <Page
                                        key={p.id}
                                        dispatch={dispatch}
                                        handleHelpPageClick={handleHelpPageClick}
                                        page={p}
                                    />
                                )}
                            </Col>
                    
                            <Col>
                                <PagesButton
                                    key={c.id}
                                    category={c}
                                    numberOfPages={pages.get(c.id)!.length}
                                />
                            </Col>
                        </div>  
                    )
                )}
            </Row>
        );
    };

    private getPages = (category: HelpPageCategory): HelpPageDTO[] => {
        const { pages } = this.props;
        const categoryPages = pages.get(category.id)!;
        const start = 0;
        const defaultEnd = 5; // Maximum of 5 help pages will show by default.
        const end = category.showAllCategoryPages ? categoryPages.length : defaultEnd;
        const slicedPages = categoryPages.slice(start, end);

        return slicedPages;
    };
};