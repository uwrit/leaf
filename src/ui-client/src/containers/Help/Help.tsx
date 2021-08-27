/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { AdminHelp } from '../Admin/AdminHelp';
import { setCurrentHelpPage } from '../../actions/helpPage';
import { adminHelpContentUnsaved, isAdminHelpContentNew, setAdminHelpContent, setCurrentAdminHelpContent } from '../../actions/admin/helpPage';
import { Content } from '../../components/Help/Content/Content';
import { Categories } from '../../components/Help/Categories/Categories';
import { HelpSearch } from '../../components/Help/Search/HelpSearch';
import { UserContext } from '../../models/Auth';
import { HelpPage } from '../../models/Help/Help';
import { AdminHelpContent, ContentRow } from '../../models/admin/Help';
import { AppState } from '../../models/state/AppState';
import { AdminHelpState } from '../../models/state/AdminState';
import { HelpPageState, HelpPageLoadState } from '../../models/state/HelpState';
import { generate as generateId } from 'shortid';
import './Help.css';

interface OwnProps { }

interface StateProps {
    helpPages: HelpPageState;
    user: UserContext;
    adminHelp: AdminHelpState;
}

interface DispatchProps {
    dispatch: any;
}

interface State { }

type Props = StateProps & OwnProps & DispatchProps;

export class Help extends React.PureComponent<Props, State> {
    private className = "help-page";

    constructor(props: Props) {
        super(props);   
        this.state = { }
    }

    public render() {
        const c = this.className;
        const { dispatch, helpPages, user, adminHelp } = this.props;
        
        if (adminHelp.state === HelpPageLoadState.LOADED) {
            return (
                <AdminHelp
                    dispatch={dispatch}    
                    content={adminHelp.content}
                    currentContent={adminHelp.currentContent}
                    currentPage={helpPages.currentSelectedPage}
                    createNew={adminHelp.createNew}
                    unsaved={adminHelp.unsaved}
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
        const { dispatch } = this.props;
        const uniqueId = generateId();

        const contentRow = Object.assign({}, {
            id: uniqueId,
            pageId: '',
            orderId: 0,
            type: 'text',
            textContent: 'Enter Text Here.',
            imageContent: '',
            imageId: ''
        }) as ContentRow;

        const newContent = Object.assign({}, {
            title: 'Enter Title Here',
            category: 'Enter Category Here',
            content: [ contentRow ]
        }) as AdminHelpContent;

        dispatch(setCurrentAdminHelpContent(newContent));
        dispatch(setAdminHelpContent(newContent, HelpPageLoadState.LOADED));
        dispatch(setCurrentHelpPage({ id: '', categoryId: '', title: '' } as HelpPage));
        dispatch(isAdminHelpContentNew(true));
        dispatch(adminHelpContentUnsaved(true));
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