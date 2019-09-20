/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { NavItem } from 'reactstrap';
import { FiUser, FiUserCheck, FiShield, FiGlobe, FiAlertOctagon } from 'react-icons/fi';
import { FaChevronDown, FaStar, FaDoorOpen } from 'react-icons/fa';
import { UserContext } from '../../models/Auth';

interface Props {
    federated: boolean;
    logoutClickHandler: () => any;
    mySavedQueriesClickHandler: () => any;
    user: UserContext;
}

export default class UserButton extends React.PureComponent<Props> {
    private className = 'header';

    public render() {
        const c = this.className;
        const { federated, logoutClickHandler, mySavedQueriesClickHandler, user } = this.props;
        const username = user ? user.name : '';

        return (
            <NavItem className={`${c}-myleaf ${c}-item-dropdown ${c}-item-hover-dark`}>
                <div className={`${c}-myleaf-icon-container`}>
                    <FiUser className={`${c}-options-icon ${c}-myleaf-icon`}/>
                    <span className={`${c}-options-text`}>{username}</span>
                    <FaChevronDown className={`${c}-options-chevron`}/>
                </div>
                <div className={`${c}-option-container ${c}-myleaf-container`}>
                    <div className={`${c}-option-inner`}>

                        {/* User Roles */}
                        {user && user.roles.length > 0 &&
                        <div className={`${c}-roles`}>

                            {/* Admin */}
                            {user.isAdmin &&
                            <div className={`${c}-role`}>
                                <FiShield className="myleaf-menu-icon header-role-icon-admin" />
                                <span>Admin</span>
                                <div className={`${c}-role-info`}>
                                    You are an administrator, which allows you to use the Admin Panel to the left.
                                </div>
                            </div>}

                            {/* PHI */}
                            {user.isPhiOkay &&
                            <div className={`${c}-role`}>
                                <FiUserCheck className="myleaf-menu-icon header-role-icon-phi" />
                                <span>PHI</span>
                                <div className={`${c}-role-info`}>
                                    You are able to see Protected Health Information by selecting Identified mode
                                    when you log in.
                                </div>
                            </div>}

                            {/* Fed */}
                            {user.isFederatedOkay &&
                            <div className={`${c}-role`}>
                                <FiGlobe className="myleaf-menu-icon header-role-icon-fed" />
                                <span>Federated</span>
                                <div className={`${c}-role-info`}>
                                    You are able to query other networked Leaf instances if these have been configured.
                                </div>
                            </div>}

                            {/* Quarantined */}
                            {!user.isFederatedOkay && federated &&
                            <div className={`${c}-role`}>
                                <FiAlertOctagon className="myleaf-menu-icon header-role-icon-quarantine" />
                                <span>Local Only</span>
                                <div className={`${c}-role-info`}>
                                    Other networked Leaf instances may be configured, but you are currently limited in access
                                    to only your home Leaf instance.
                                </div>
                            </div>}

                        </div>}

                        <div className={`${c}-option`} onClick={mySavedQueriesClickHandler}>
                            <FaStar className="myleaf-menu-icon myleaf-menu-icon-savedqueries" />
                            <span>My Saved Queries</span>
                        </div>
                        <div className={`${c}-option`} onClick={logoutClickHandler}>
                            <FaDoorOpen className="myleaf-menu-icon myleaf-menu-icon-logout" />
                            <span>Log Out</span>
                        </div>
                    </div>
                </div>
            </NavItem>
        );
    }
}
