import React from 'react';
import { NavItem } from 'reactstrap';
import { FiUser, FiUserCheck, FiShield } from 'react-icons/fi';
import { FaChevronDown, FaDoorOpen } from 'react-icons/fa';
import { AuthorizationState } from '../../models/state/AppState';
import { UserContext } from '../../models/Auth';

interface Props {
    auth?: AuthorizationState;
    user: UserContext;
}

export default class UserButton extends React.PureComponent<Props> {
    private className = 'header';

    public render() {
        const c = this.className;
        const { auth, user } = this.props;
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
                        </div>
                        }

                        <div className={`${c}-option-divider`} />

                        <div className={`${c}-option ${c}-option-logout`}>
                            <FaDoorOpen className="myleaf-menu-icon myleaf-menu-icon-logout" />
                            <span>Log Out</span>
                        </div>
                    </div>
                </div>
            </NavItem>
        );
    }
}
