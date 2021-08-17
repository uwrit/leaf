/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Content } from '../../components/Help/Content/Content';
import { Categories } from '../../components/Help/Categories/Categories';
import { HelpSearch } from '../../components/Help/Search/HelpSearch';
import { AppState } from '../../models/state/AppState';
import { AdminHelpState } from '../../models/state/AdminState';
import { UserContext } from '../../models/Auth';
import { HelpPageState, HelpPageLoadState } from '../../models/state/HelpState';
import { AdminHelpContent } from '../Admin/AdminHelpContent';
import { AdminHelpCreate } from '../Admin/AdminHelpCreate';
import './Help.css';

import { HelpPage, HelpPageContent } from '../../models/Help/Help';
import { HelpPageContentTState } from '../../models/state/HelpState';
import { Button } from 'reactstrap';

interface OwnProps { }

interface StateProps {
    helpPages: HelpPageState;
    user: UserContext;
    adminHelp: AdminHelpState;
}

interface DispatchProps {
    dispatch: any;
}

interface State {
    createNewPage: boolean;
}

type Props = StateProps & OwnProps & DispatchProps;

export class Help extends React.PureComponent<Props, State> {
    private className = "help-page";

    constructor(props: Props) {
        super(props);   
        this.state = { createNewPage: false }
    }

    public render() {
        const c = this.className;
        const { dispatch, helpPages, user, adminHelp } = this.props;
        const { createNewPage } = this.state;
        
        if (createNewPage) {
            return (
                <AdminHelpCreate
                    dispatch={dispatch}
                />
            );
        };
        
        if (adminHelp.state === HelpPageLoadState.LOADED) {
            return (
                <AdminHelpContent
                    currentPage={helpPages.currentSelectedPage}
                    dispatch={dispatch}
                    content={adminHelp.content}
                    currentContent={adminHelp.currentContent!}
                />
            );
        };

        if (helpPages.content.state === HelpPageLoadState.LOADED) {
            return (
                <div className={`${c}-content`}>
                    <Content
                        content={helpPages.content.content}
                        currentPage={helpPages.currentSelectedPage}
                        dispatch={dispatch}
                    />
                </div>
            );
        };

        return (
            <div className={c}>
                <div className={`${c}-display`}>
                    
                    {user.isAdmin &&
                        <Button className={`${c}-create-button`} color="success" onClick={this.handleCreateNewPage}>
                            Create New Help Page
                        </Button>
                    }

                    <HelpSearch />
                    
                    {(helpPages.state === HelpPageLoadState.LOADED) &&
                        <Categories
                            categories={helpPages.categories}
                            dispatch={dispatch}
                            isAdmin={user.isAdmin}
                        />
                    }
                </div>
            </div>
        );
    };

    private handleCreateNewPage = () => {
        this.setState({ createNewPage: true });
    };
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        helpPages: state.help,
        user: state.auth.userContext!,
        adminHelp: state.admin!.help
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return { dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(Help)