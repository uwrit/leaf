/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Input, Row, Col, Table } from 'reactstrap';
import { Page } from './Page';
import { Category } from './Category';
import './Pages.css';
import { HelpPagesState, HelpPagesLoadState } from '../../models/state/HelpState';
import { HelpPages } from '../../models/Help/HelpPages';

interface Props {
    dispatch: any;
    data: HelpPagesState;
}

interface State {
    
}

export class Pages extends React.Component<Props, State> {

    private className = "pages";
    
    constructor(props: Props) {
        super(props);
        this.state = { }
    }

    public render() {
        const { data } = this.props;
        const c = this.className;

        return (
            <Container fluid={true} className={c}>

                <Row>
                    <Input className={`${c}-searchbar`} type="text" name="pages-search" id="pages-search" placeholder="Search..." bsSize="lg" />
                </Row>

                <Row className={`${c}-category`}>
                    {data.state === HelpPagesLoadState.LOADED &&
                        data.pageCategory.map(cat =>
                            <div>
                                <Col>
                                {/* add Category.css file so that you can change font size: div.a { font-size: 15px; }  */}
                                    <Category key={cat.id} category={cat} />
                                </Col>
                                
                                <Col className={`${c}-page`}>
                                    {data.pages.map(p =>
                                        p.categoryId === cat.id &&
                                            <Page key={p.id} page={p} />
                                        )
                                    }
                                </Col>
                            </div>
                        )
                    }
                </Row>

            </Container>
        );
    }
}

