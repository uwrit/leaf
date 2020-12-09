/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Container, Button } from 'reactstrap';
import { resetHelpPageContent } from '../../actions/help/helpPageContent';
import { Content } from '../../components/Help/Content/Content';
import { Pages } from '../../components/Help/Pages/Pages';
import { AppState } from '../../models/state/AppState';
import { HelpPagesState, HelpPageLoadState } from '../../models/state/HelpState';

interface OwnProps { }

interface StateProps {
    helpPages: HelpPagesState;
}

interface DispatchProps {
    dispatch: any;
}

interface State {
    pageTitle: string;
}

type Props = StateProps & OwnProps & DispatchProps;

export class Help extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            pageTitle: ''
        }
    }

    public render() {
        const { dispatch, helpPages } = this.props;

        if (helpPages.pageContent.state === HelpPageLoadState.LOADED) {
            return this.getContent();
        };

        return (
            <Pages
                dispatch={dispatch}
                handleHelpPageSelected={this.handleHelpPageSelected}
                pages={helpPages}
            />
        );
    };

    private getContent = () => {
        const { helpPages } = this.props;
        const { pageTitle } = this.state;

        return (
            // implement a component <Content /> and convert current content component to <ContentText />
            <Container fluid={true}>
                <div>
                    <b>{pageTitle}</b>
                    {helpPages.pageContent.content.map((c, i) =>
                        <Content key={i} content={c} />
                    )}

                    <Button color="primary" onClick={this.handleContentGoBackClick}>GO BACK</Button>
                </div>
            </Container>
        )
    }

    private handleContentGoBackClick = () => {
        const { dispatch } = this.props;

        dispatch(resetHelpPageContent());
    }

    private handleHelpPageSelected = (pageTitle: string) => {
        this.setState({
            pageTitle: pageTitle
        });
    }

};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        helpPages: state.help
    };
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return { dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(Help)