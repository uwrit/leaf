/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Input, InputGroup } from 'reactstrap';
import { keys } from '../../../models/Keyboard';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon';
import { AdminUserQueryState } from '../../../models/state/AdminState';
import { setAdminUserSearchTerm, searchAdminQueryUsers, searchAdminQueriesByUser } from '../../../actions/admin/userQuery';
import { LeafUser } from '../../../models/admin/LeafUser';
import './UserSearchBox.css';

interface Props {
    dispatch: any;
    userQueryState: AdminUserQueryState
}

interface State {
    debounceTimer?: NodeJS.Timer;
    selectedUserIndex: number;
    showUsersDropdown: boolean;
}

export default class UserSearchBox extends React.PureComponent<Props, State> {
    private className = 'admin-user-search';
    private debounceTimeoutMs = 300;
    private minSearchCharLength = 1;
    private prevSearchTerm = '';

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedUserIndex: -1,
            showUsersDropdown: false
        }
    }

    public getSnapshotBeforeUpdate(prevProps: Props): any {
        const { userQueryState } = this.props;

        if (prevProps.userQueryState.users.length !== userQueryState.users.length) {
            this.setState({ selectedUserIndex: -1 });
        }
        return null;
    }

    public componentDidUpdate() { return; }

    public render() {
        const { userQueryState } = this.props;
        const { searchTerm, users, fetchingUsers, fetchingQueries } = userQueryState;
        const { selectedUserIndex, showUsersDropdown } = this.state;
        const c = this.className;
        const hintClass = `${c}-hint-item leaf-dropdown-item`;
        
        return (
            <div className={`${c}-container`}>
                <InputGroup>
                    
                    {/* Search box container */}
                    <div className={`${c}-input-container`}>

                        {/* Search input */}
                        <Input 
                            className={`${c}-input leaf-input`} 
                            onBlur={this.handleInputBlur}
                            onChange={this.handleSearchInputChange}
                            onFocus={this.handleInputFocus}
                            onKeyDown={this.handleSearchKeydown}
                            placeholder="Search users..." 
                            spellCheck={false}
                            value={searchTerm} />

                        {/* Clear search text button */}
                        {searchTerm.length > 0 && !fetchingUsers &&
                        <div className={`${c}-input-clear`}>
                            <span onClick={this.handleSearchTextClear}>✖</span>
                        </div>
                        }

                        {/* Spinnner shown when searching users */}
                        {fetchingUsers &&
                        <LoaderIcon />
                        }

                        {/* Search suggestions pseudo-dropdown */}
                        {showUsersDropdown && !fetchingQueries &&
                        <div className={`${c}-hint-container`}>
                            {users.map((u,i) => {
                                return (
                                    <div className={`${hintClass} ${selectedUserIndex === i ? 'selected' : ''}`} key={u.id} onClick={this.handleUserNameClick.bind(null, u)}>
                                        <span className={`${c}-hint-name`}>{u.name}</span>
                                        <span className={`${c}-hint-scope`}>@{u.scope}</span>
                                        <span className={`${c}-hint-query-count`}>{u.savedQueryCount} {u.savedQueryCount === 1 ? 'query' : 'queries'}</span>
                                    </div>
                                )
                            })}
                        </div>
                        }
                    </div>
                </InputGroup>
            </div>
        )
    }

    /*
     * Show the suggestions dropdown if the input gains focus.
     */
    private handleInputFocus = () => this.setState({ showUsersDropdown: true });

    /*
     * Hide the suggestions dropdown if the input loses focus. A bit hacky,
     * but setTimeout() is needed to allow onClick() events for the usersDropdown to run.
     * If there is no timeout, the onBlur() call occurs first, and the usersDropdown items are
     * quietly hidden before the onClick() event can actually be called.
     */
    private handleInputBlur = () => setTimeout(() => this.setState({ showUsersDropdown: false }), 200);

    private handleArrowUpDownKeyPress = (key: number) => {
        const { showUsersDropdown, selectedUserIndex } = this.state;
        const { dispatch, userQueryState } = this.props;
        if (!showUsersDropdown) { return selectedUserIndex; }

        const currentFocus = selectedUserIndex;
        const hintCount = userQueryState.users.length;
        const minFocus = 0;
        const maxFocus = hintCount - 1;
        const newFocus = key === keys.ArrowUp
            ? currentFocus === minFocus ? maxFocus : currentFocus - 1
            : currentFocus === maxFocus ? minFocus : currentFocus + 1;
            
        if (userQueryState.users[newFocus]) {
            dispatch(setAdminUserSearchTerm(userQueryState.users[newFocus].scopedIdentity));
        }
        return newFocus;
    }

    private handleEnterKeyPress = (term: string) => {
        const { userQueryState, dispatch } = this.props;
        const { debounceTimer } = this.state;

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        if (term && term !== this.prevSearchTerm) {
            
            const userIdx = userQueryState.users.findIndex(u => u.scopedIdentity.startsWith(term));
            if (userIdx > -1) {
                this.setState({ selectedUserIndex: -1, showUsersDropdown: false });
                dispatch(searchAdminQueriesByUser(userQueryState.users[userIdx]));
            }
        }
    }
    
    private handleSearchKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { userQueryState } = this.props;
        const { selectedUserIndex } = this.state;
        const { searchTerm } = userQueryState;
        const key = (k.key === ' ' ? keys.Space : keys[k.key as any]);

        if (!key || searchTerm.length < this.minSearchCharLength) { return; }
        let newFocus = selectedUserIndex;

        switch (key) {
            case keys.ArrowUp: 
            case keys.ArrowDown:
                newFocus = this.handleArrowUpDownKeyPress(key);
                k.preventDefault();
                break;
            case keys.Backspace:
                newFocus = -1;
                break;
            case keys.Enter:
                this.handleEnterKeyPress(searchTerm);
                break;
            case keys.Escape:
                this.handleSearchTextClear();
                break;
        }
        if (newFocus !== selectedUserIndex) {
            this.setState({ selectedUserIndex: newFocus });
        }
    }

    private handleSearchTextClear = () => {
        const { dispatch } = this.props;
        dispatch(setAdminUserSearchTerm(''));
    }

    private handleSearchInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.handleSearchInput(e.currentTarget.value);
    }

    private handleSearchInput = (term: string) => {
        const { dispatch } = this.props;
        const { debounceTimer } = this.state;
        dispatch(setAdminUserSearchTerm(term));

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        if ((term.length >= this.minSearchCharLength && !(term.startsWith(this.prevSearchTerm))) || Math.abs(term.length - this.prevSearchTerm.length) <= 2) {
            this.prevSearchTerm = term;
            this.setState({
                showUsersDropdown: true,
                debounceTimer: setTimeout(() => {
                    dispatch(searchAdminQueryUsers(term));
                }, this.debounceTimeoutMs)
            });
        } else if (!term.length) {
            this.setState({ showUsersDropdown: false });
        }
    }

    private handleUserNameClick = (user: LeafUser) => {
        const { dispatch } = this.props;
        dispatch(searchAdminQueriesByUser(user));
        dispatch(setAdminUserSearchTerm(user.scopedIdentity))
    }
}