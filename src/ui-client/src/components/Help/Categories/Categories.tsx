/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row, Col } from 'reactstrap';
import { HelpCategoryMap, HelpPageDTO } from '../../../models/Help/Help';
import { Pages } from '../Pages/Pages';
import './Categories.css';

interface Props {
    categories: HelpCategoryMap;
    dispatch: any;
    isAdmin: boolean;
    newCategory: string;
    newTitle: string;
}

export class Categories extends React.Component<Props> {
    private className = "categories";

    public render() {
        const c = this.className;
        const { categories, dispatch, isAdmin, newCategory, newTitle } = this.props;
        const cats = [ ...categories.values() ];

        // Getting first value from filter array since there will only be one match.
        const existingCat = cats.filter(c => c.name.toLowerCase() === newCategory.toLowerCase())[0];
        const tempCatId = existingCat ? existingCat.id : '';
        const tempPage = { id: '', categoryId: tempCatId, title: newTitle } as HelpPageDTO;

        return (
            <Row className={c}>
                {cats.map(c =>
                    <Pages
                        key={c.id}
                        category={c}
                        dispatch={dispatch}
                        isAdmin={isAdmin}
                        tempHelpPage={tempPage}
                    />
                )}
                
                {(newCategory && !tempCatId) &&
                    <Col>
                        <div><b>{newCategory.toUpperCase()}</b></div>
                        <div style={{color: "#FF0000"}}>{newTitle}</div>
                    </Col>
                }
            </Row>
        );
    };
};