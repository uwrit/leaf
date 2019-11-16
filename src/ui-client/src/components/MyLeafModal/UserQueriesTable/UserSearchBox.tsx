/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
import { setAdminUserSearchTerm, searchAdminQueryUsers } from '../../../actions/admin/userQuery';
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
    private debounceTimeoutMs = 200;
    private minSearchCharLength = 1;
    private prevSearchTerm = '';

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedUserIndex: -1,
            showUsersDropdown: false
        }
    }

    public render() {
        const { userQueryState } = this.props;
        const { searchTerm, users, fetchingUsers } = userQueryState;
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
                        {showUsersDropdown && !fetchingUsers &&
                        <div className={`${c}-hint-container`}>
                            {users.map((u,i) => {
                                return (
                                    <div className={`${hintClass} ${selectedUserIndex === i ? 'selected' : ''}`} key={u.id}>
                                        {u.scopedIdentity}
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

    private toggleUsersDropdown = () => {
        this.setState({ showUsersDropdown: !this.state.showUsersDropdown });
    }

    private handleInputFocus = () => this.setState({ showUsersDropdown: true });

    private handleInputBlur = () => this.setState({ showUsersDropdown: false });

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

    /*
    private handleEnterKeyPress = (term: string) => {
        const { userQueryState, dispatch } = this.props;
        const { debounceTimer, selectedUserIndex } = this.state;

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        if (term && term !== this.previousTerm) {
            
            this.setState({ selectedUserIndex: -1, showUsersDropdown: false });

            // If a hint is currently focused, find its tree
            if (hint) {
                dispatch(fetchSearchTreeFromConceptHint(hint));
            }
            // Else need to check if we have an exact or approximate hint match
            else {
                const directMatchHint = hints.length === 1
                    ? hints[0]
                    : hints.find((h: AggregateConceptHintRef) => h.fullText === term);
                if (directMatchHint) {
                    dispatch(fetchSearchTreeFromConceptHint(directMatchHint));
                }
                // Else we could try getting approximate matches and choose the closest, but it may be that the user wants
                // ALL related concepts returned based on the input, so grab the tree based on the search term
                else {
                    dispatch(fetchSearchTreeFromTerms(term));
                }
            }
        }
        else {
            this.setState({ showUserssDropdown: false });
        }
    }
    */
    private handleSearchKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { userQueryState } = this.props;
        const { selectedUserIndex } = this.state;
        const { searchTerm, users } = userQueryState;
        const key = (k.key === ' ' ? keys.Space : keys[k.key as any]);

        if (!key || searchTerm.length < this.minSearchCharLength) { return; }
        let newFocus = selectedUserIndex;

        /*
        switch (key) {
            case keys.ArrowUp: 
            case keys.ArrowDown:
                newFocus = this.handleArrowUpDownKeyPress(key, users);
                k.preventDefault();
                break;
            case keys.Backspace:
                newFocus = -1;
                break;
            case keys.Enter:
                this.handleEnterKeyPress(term, currentHints);
                break;
            case keys.Space:
                this.handleSpacebarKeyPress(term, newFocus, currentHints);
                break;
            case keys.Escape:
                this.handleSearchTextClear();
                break;
        }
        if (newFocus !== selectedHintIndex) {
            this.setState({ selectedHintIndex: newFocus });
        }
        */
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

        if (term.length >= this.minSearchCharLength && !(term.startsWith(this.prevSearchTerm)) || Math.abs(term.length - this.prevSearchTerm.length) <= 2) {
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
}