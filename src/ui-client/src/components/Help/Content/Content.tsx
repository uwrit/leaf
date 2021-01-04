/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Button } from 'reactstrap';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { resetHelpPageContent } from '../../../actions/help/helpPageContent';
import { ContentText } from './ContentText';
import { HelpPageContent } from '../../../models/Help/Help';
import './Content.css';

interface Props {
    data: HelpPageContent[];
    dispatch: any;
    title: string;
}

export class Content extends React.Component<Props> {
    private className = "content"

    public render() {
        const c = this.className;
        const { data, title } = this.props;

        return (
            <Container className={c}>
                <IoIosArrowRoundBack className={`${c}-back-arrow`} onClick={this.handleContentGoBackClick} />
                
                <div className={`${c}-display`}>
                    <b>{title}</b>
                    {data.map((c, i) =>
                        <ContentText key={i} content={c} />
                    )}

                    {/* <Button className={`${c}-back-button`} color="primary" onClick={this.handleContentGoBackClick}>GO BACK</Button> */}
                </div>
            </Container>
        );
    };

    private handleContentGoBackClick = () => {
        const { dispatch } = this.props;
        dispatch(resetHelpPageContent());
    };
}