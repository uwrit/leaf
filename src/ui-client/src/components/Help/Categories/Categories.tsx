/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row } from 'reactstrap';
import { HelpPageCategory, HelpPageMap, HelpCategoryMap, HelpPage } from '../../../models/Help/Help';
import { Pages } from '../Pages/Pages';
import './Categories.css';

interface Props {
    // categories: HelpPageCategory[];
    dispatch: any;
    pages: HelpPageMap;

    categoriesA: HelpCategoryMap;
    currentPage?: HelpPage;
}

export class Categories extends React.Component<Props> {
    private className = "categories";

    public render() {
        const c = this.className;
        const { categoriesA, currentPage, dispatch, pages } = this.props;
        const cat = [...categoriesA!.values()] //.filter(c => c.pages.length > 0);

        return (
            <Row className={c}>
                {/* {categories.map(c =>
                    pages.has(c.id) &&
                        <Pages
                            key={c.id}
                            category={c}
                            dispatch={dispatch}
                            pages={pages.get(c.id)!}
                        />
                )} */}

                {cat.map(c=>
                    // (c.pages!.length>0) &&
                    <Pages
                        key={c.id}
                        category={c && c}
                        dispatch={dispatch}
                        pages={c.pages}
                    />
                )}
            </Row>
        );
    };
};