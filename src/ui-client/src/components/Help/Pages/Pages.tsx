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
import { HelpPagesState, HelpPageLoadState, PairedState } from '../../../models/state/HelpState';
import './Pages.css';


interface Props {
    data: HelpPagesState;
    dispatch: any;
    handleHelpPageSelected: (pageTitle: string) => any;
}

export class Pages extends React.Component<Props> {
    private className = "pages";

    public render() {
        const c = this.className;
        const { data, dispatch, handleHelpPageSelected } = this.props;

        return (
            <Container fluid={true} className={c}>

                <Row>
                    <Input className={`${c}-searchbar`} type="text" name="pages-search" id="pages-search" placeholder="Search..." bsSize="lg" />
                </Row>

                <Row className={`${c}-category`}>
                    {(data.state === HelpPageLoadState.LOADED && data.paired === PairedState.PAIRED) &&
                        data.pairedPagesCategories.map((pair, i) =>
                            <div key={i}>
                                <Col>
                                    <Category category={pair.category} />
                                </Col>

                                <Col className={`${c}-page`}>
                                    {pair.pages.map(p =>
                                        <Page key={p.id}
                                              dispatch={dispatch}
                                              handleHelpPageSelected={handleHelpPageSelected}
                                              page={p}
                                        />
                                    )}
                                </Col>
                            </div>
                        )
                    }
                </Row>

            </Container>
        );
    };
};