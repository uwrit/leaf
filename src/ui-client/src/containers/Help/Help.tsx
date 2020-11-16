/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import Pages from '../../components/Help/Pages';
import { HelpPages, HelpPageContent } from '../../models/Help/HelpPages';
import { HelpPagesState } from '../../models/state/AppState';

interface OwnProps {
    
}

interface StateProps {
    pages: HelpPages[];
    pageContent: HelpPageContent;
}

interface DispatchProps {
    dispatch: any;
}

type Props = StateProps & OwnProps & DispatchProps;

export class Help extends React.PureComponent<Props> {
    public render() {
        const { dispatch } = this.props;
        return (
            <Pages dispatch={dispatch} />
        );
    };
};

const mapStateToProps = (state: HelpPagesState, ownProps: OwnProps): StateProps => {
    return {
        pages: state.pages,
        pageContent: state.pageContent!
    };
}

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps) : DispatchProps => {
    return { dispatch };
}

export default connect<StateProps, DispatchProps, OwnProps, HelpPagesState>
    (mapStateToProps, mapDispatchToProps)(Help)