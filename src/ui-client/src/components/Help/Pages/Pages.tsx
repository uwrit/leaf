/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Input, Row, Col } from 'reactstrap';
import { Category } from '../Category/Category';
import { Page } from '../Page/Page';
import { HelpPagesState, HelpPageLoadState } from '../../../models/state/HelpState';
import './Pages.css';


interface Props {
    dispatch: any;
    handleHelpPageSelected: (pageTitle: string) => any;
    pages: HelpPagesState;
}

export class Pages extends React.Component<Props> {

    private className = "pages";

    public render() {
        const { dispatch, handleHelpPageSelected, pages } = this.props;
        const c = this.className;

        return (
            <Container fluid={true} className={c}>

                <Row>
                    <Input className={`${c}-searchbar`} type="text" name="pages-search" id="pages-search" placeholder="Search..." bsSize="lg" />
                </Row>

                <Row className={`${c}-category`}>
                    {pages.state === HelpPageLoadState.LOADED &&
                        pages.pageCategory.map((cat, i) =>
                            <div key={i}>
                                <Col>
                                    <Category key={cat.id} category={cat} />
                                </Col>
                                
                                <Col className={`${c}-page`}>
                                    {pages.pages.map(p =>
                                        (p.categoryId === cat.id) &&
                                            <Page key={p.id}
                                                  dispatch={dispatch}
                                                  handleHelpPageSelected={handleHelpPageSelected}
                                                  page={p}
                                            />
                                        )
                                    }
                                </Col>
                            </div>
                        )
                    }
                </Row>

            </Container>
        );
    };
};