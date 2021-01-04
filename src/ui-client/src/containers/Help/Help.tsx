/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Container, Input, Row } from 'reactstrap';
import { Content } from '../../components/Help/Content/Content';
import { Categories } from '../../components/Help/Categories/Categories';
import { AppState } from '../../models/state/AppState';
import { HelpPageState, HelpPageLoadState } from '../../models/state/HelpState';
import './Help.css';

interface OwnProps { }

interface StateProps {
    helpPages: HelpPageState;
}

interface DispatchProps {
    dispatch: any;
}

interface State {
    pageTitle: string;
}

type Props = StateProps & OwnProps & DispatchProps;

export class Help extends React.PureComponent<Props, State> {
    private className = "help-page";

    constructor(props: Props) {
        super(props);
        this.state = {
            pageTitle: ''
        }
    }

    public render() {
        const c = this.className;
        const { dispatch, helpPages } = this.props;
        const { pageTitle } = this.state;

        if (helpPages.content.state === HelpPageLoadState.LOADED) {
            return (
                <div style={{backgroundColor:"rgb(240,240,240)"}}>
                    <Content data={helpPages.content.content} dispatch={dispatch} title={pageTitle} />
                </div>)
        };

        return (
            <Container className={c}>
                <Row>
                    <Input className={`${c}-searchbar`} type="text" name="pages-search" id="pages-search" placeholder="Search..." bsSize="lg" />
                </Row>

                {(helpPages.state === HelpPageLoadState.LOADED) &&
                    <Categories
                        categories={helpPages.categories}
                        dispatch={dispatch}
                        handleHelpPageClick={this.handleHelpPageClick}
                        pages={helpPages.pages}
                    />
                }
            </Container>
        );
    };

    private handleHelpPageClick = (pageTitle: string) => {
        this.setState({ pageTitle: pageTitle });
    };

};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        helpPages: state.help
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return { dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(Help)