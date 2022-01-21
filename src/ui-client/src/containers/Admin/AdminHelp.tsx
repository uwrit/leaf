/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Dropdown, DropdownMenu, DropdownToggle, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { exampleText }  from '../../components/Admin/HelpEditor/ExampleText';
import { Categories } from '../../components/Admin/HelpEditor/Categories/Categories';
import { HelpSearch } from '../../components/Help/Search/HelpSearch';
import { AppState } from '../../models/state/AppState';
import { AdminHelpPageLoadState, AdminHelpPageState } from '../../models/state/AdminState';
import { generate as generateId } from 'shortid';

import './AdminHelp.css';
import { AdminHelpPageAndContent, AdminHelpPage, AdminHelpPageCategory, AdminHelpPageContent } from '../../models/admin/Help';
import { setAdminHelpPageAndContent, setCurrentAdminHelpPageAndContent, setCurrentSelectedAdminHelpPage, isAdminHelpPageNew, isAdminHelpPageUnsaved} from '../../actions/admin/helpPage';
import { HelpEditor } from '../../components/Admin/HelpEditor/HelpEditor';

interface OwnProps { }

interface StateProps {
    adminHelp: AdminHelpPageState;
}

interface DispatchProps {
    dispatch: any;
}

interface State {
    show: boolean;
    category: string;
    title: string;
}

type Props = StateProps & OwnProps & DispatchProps;

export class AdminHelp extends React.PureComponent<Props, State> {
    private className = "admin-help";

    constructor(props: Props) {
        super(props);   
        this.state = {
            show: false,
            category: '',
            title: ''
        }
    }

    public render() {
        const c = this.className;
        const { dispatch, adminHelp } = this.props;
        const { show, category, title } = this.state;
        
        if (adminHelp.content.contentState === AdminHelpPageLoadState.LOADED) {
            return (
                <HelpEditor
                    dispatch={dispatch}
                    content={adminHelp.content.page}
                    currentContent={adminHelp.currentContent}
                    currentPage={adminHelp.currentSelectedPage}
                    isNew={adminHelp.isNew}
                    unsaved={adminHelp.unsaved}
                />
            );
        };

        return (
            <div className={c}>
                <div className={`${c}-display`}>
                    <div>
                        <Dropdown className={`${c}-create-dropdown-container`} isOpen={show} toggle={this.handleShow}>
                            <DropdownToggle caret className="leaf-button-addnew">
                                New Help Page
                            </DropdownToggle>
                            <DropdownMenu right>
                                <div className={`${c}-create-button-item`}>
                                    Title <Input value={title} onChange={this.handleTitleChange} />
                                </div>
                                <div className={`${c}-create-button-item`}>
                                    Category <Input value={category} onChange={this.handleCategoryChange} />
                                </div>
                                <div className={`${c}-create-button-item`}>
                                    <Button className="leaf-button-addnew" onClick={this.handleCreateNewPage}>
                                        <span>+ Create</span>
                                    </Button>
                                </div>
                            </DropdownMenu>
                        </Dropdown>
                    </div>

                    <HelpSearch />
                    
                    {(adminHelp.helpState === AdminHelpPageLoadState.LOADED) &&
                        <Categories
                            categories={adminHelp.categories}
                            newCategory={category}
                            newTitle={title}
                            dispatch={dispatch}
                        />
                    }
                </div>
            </div>
        );
    };

    private handleShow = () => {
        const { show } = this.state;
        this.setState({ show: !show, category: '', title: '' });
    };

    private handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value;
        this.setState({ category: val });
    };

    private handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value;
        this.setState({ title: val });
    };

    private handleCreateNewPage = () => {
        const { dispatch } = this.props;
        const { category, title, show } = this.state;
        const uniqueId = generateId();

        const contentRow = Object.assign({}, {
            id: uniqueId,
            pageId: '',
            orderId: 0,
            type: 'text',
            textContent: exampleText,
            imageId: '',
            imageContent: '',
            imageSize: 0
        }) as AdminHelpPageContent;

        const newContent = Object.assign({}, {
            title: title ? title : ' Example Title',
            category: { id: '', name: category ? category : 'Example Category' } as AdminHelpPageCategory,
            content: [ contentRow ]
        }) as AdminHelpPageAndContent;

        dispatch(setCurrentAdminHelpPageAndContent(newContent));
        dispatch(setAdminHelpPageAndContent(newContent, AdminHelpPageLoadState.LOADED));
        dispatch(setCurrentSelectedAdminHelpPage({} as AdminHelpPage));
        dispatch(isAdminHelpPageNew(true));
        dispatch(isAdminHelpPageUnsaved(true));
        
        //  Clear the values so that when user clicks the "go back arrow" from content after clicking "+ Create", category/title are reset.
        this.setState({ show: !show, category: '', title: '' });
    };
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        adminHelp: state.admin!.help
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return { dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminHelp)