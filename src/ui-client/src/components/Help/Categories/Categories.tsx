/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row, Col } from 'reactstrap';
import { HelpCategoryMap } from '../../../models/Help/Help';
import { Pages } from '../Pages/Pages';
import './Categories.css';

interface Props {
    newCategory: string;
    newTitle: string;
    
    categories: HelpCategoryMap;
    dispatch: any;
    isAdmin: boolean;
}

export class Categories extends React.Component<Props> {
    private className = "categories";

    public render() {
        const c = this.className;
        const { categories, dispatch, isAdmin, newCategory, newTitle } = this.props;
        const cats = [ ...categories.values() ];
        
        const existingCategory = cats.find(c => c.category.toLowerCase() === newCategory);
        console.log(existingCategory);

        return (
            <Row className={c}>
                {cats.map(c =>
                    <Pages
                        key={c.id}
                        category={c}
                        dispatch={dispatch}
                        isAdmin={isAdmin}
                    />
                )}
                
                {newCategory &&
                    <Col>
                        <div><b>{newCategory.toUpperCase()}</b></div>
                        <div style={{color: "#007bff"}}>{newTitle}</div>
                    </Col>
                }
            </Row>
        );
    };
};