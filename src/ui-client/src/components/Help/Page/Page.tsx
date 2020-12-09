/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button } from 'reactstrap';
import { fetchSingleHelpPageContent, resetHelpPageContent } from '../../../actions/help/helpPageContent';
import { HelpPages } from '../../../models/Help/HelpPages';
import './Page.css';

interface Props {
    dispatch: any;
    handleHelpPageSelected: (pageTitle: string) => any;
    page: HelpPages;
}

export class Page extends React.Component<Props> {
    private className = "page";

    public render() {
        const c = this.className;
        const { page } = this.props;

        return (
            <div className={c}>
                <Button color="link" onClick={this.handlePageTitleClick}>
                    {page.title.toUpperCase()}
                </Button>
            </div>
        );
    };

    private handlePageTitleClick = () => {
        const { dispatch, handleHelpPageSelected, page } = this.props;

        dispatch(resetHelpPageContent());
        dispatch(fetchSingleHelpPageContent(page.id));

        handleHelpPageSelected(page.title);
    };

}