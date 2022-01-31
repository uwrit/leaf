/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row } from 'reactstrap';
import { HelpCategoryPageCache } from '../../../models/help/Help';
import { Pages } from '../Pages/Pages';
import './Categories.css';

interface Props {
    categories: HelpCategoryPageCache[];
    dispatch: any;
}

export class Categories extends React.Component<Props> {
    private className = "categories";

    public render() {
        const c = this.className;
        const { categories, dispatch } = this.props;
        // Filter categories to get only categories that have pages.
        const newCatsList = categories.filter(c => c.partialPages.length);

        return (
            <Row className={c}>
                {newCatsList.map(c =>
                    <Pages
                        key={c.id}
                        category={c}
                        dispatch={dispatch}
                    />
                )}
            </Row>
        );
    };
};