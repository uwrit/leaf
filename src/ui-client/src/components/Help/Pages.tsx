/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Container, Input, Row } from 'reactstrap';
import { fetchSingleHelpPage } from '../../actions/helpPages';
import './Pages.css';

interface Props {
    dispatch: any;
    // pages: HelpPages[];
    // pageContent: HelpPageContent;
    // handleClick: () => any;
}

interface State {
    show: boolean;
}

export default class Pages extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            show: false
        }
    }

    public render() {
        // const { pageContent } = this.props;
        const { show } = this.state;
        // const content = this.getContent()
        return (
            <Container fluid={true}>
                <Row>
                    <Input className="pages-searchbar" type="text" name="pages-search" id="pages-search" placeholder="Search..." bsSize="lg" />
                </Row>
            
                <Row className="pages-category">
                    <div className="pages"> {/* TODO: change className to something else */}
                        <button type="submit" onClick={this.handleClick}>Get Help Pages</button>
                        {show && "content"}
                    </div>
                </Row>
            </Container>
        );
    }

    private handleClick = () => {
        // const { dispatch } = this.props;
        this.setState({
            show: !this.state.show
        })
        // dispatch(fetchSingleHelpPage(1));
    };

    private getContent = () => {
        const { dispatch } = this.props;
        // const pageId = pageContent.pageId;
        // const { pageId } = pageContent!;
        // console.log("got called");
        dispatch(fetchSingleHelpPage(1));
        console.log(dispatch(fetchSingleHelpPage(1)));
        // return pageContent
    }

}

