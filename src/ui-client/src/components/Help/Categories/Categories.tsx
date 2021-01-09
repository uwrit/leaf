/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row } from 'reactstrap';
import { HelpPageCategory, HelpPageMap } from '../../../models/Help/Help';
import { Pages } from '../Pages/Pages';
import './Categories.css';

interface Props {
    categories: HelpPageCategory[];
    dispatch: any;
    pages: HelpPageMap;
}

export class Categories extends React.Component<Props> {
    private className = "categories";

    public render() {
        const c = this.className;
        const { categories, dispatch, pages } = this.props;
        
        return (
            <Row className={c}>
                {categories.map(c =>
                    pages.has(c.id) &&
                        <Pages
                            key={c.id}
                            category={c}
                            dispatch={dispatch}
                            pages={pages.get(c.id)!}
                        />
                )}
            </Row>
        );
    };
};