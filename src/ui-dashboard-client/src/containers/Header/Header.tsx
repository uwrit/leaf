import React from 'react';
import { connect } from 'react-redux'
import { Navbar, Nav } from 'reactstrap';
import UserButton from '../../components/Header/UserButton';
import { UserContext } from '../../models/Auth';
import { AppState, AuthorizationState } from '../../models/state/AppState';
import './Header.css';

interface OwnProps {
    dashboardName?: string;
}
interface StateProps {
    auth: AuthorizationState;
    user: UserContext;
}
interface DispatchProps {
    dispatch: any;
}
type Props = StateProps & DispatchProps & OwnProps;

class Header extends React.PureComponent<Props> {
    public render() {
        const { auth, dashboardName, user } = this.props;
        const c = 'header';

        return (
            <Navbar id={`${c}-container`} className="d-flex justify-content-between mb-3">
                <div className={`${c}-content-side`}>
                    <div className={`${c}-title`} >
                        <img alt="leaf-logo" className="logo" src={process.env.PUBLIC_URL + '/images/logos/apps/leaf.svg'} />
                        <div className="title">leaf</div>
                    </div>
                </div>
                <div className="mx-auto">
                    <div className={`${c}-dashboard-title`}>
                        {dashboardName}
                    </div>
                </div>
                <div className={`${c}-content-side ${c}-content-side-right`}>
                    <Nav className={`${c}-options`}>
                        {/* User */}
                        <UserButton
                            auth={auth}
                            user={user} 
                        />
                    </Nav>
                </div>
            </Navbar>
        );
    }

    /*
     * Handles 'Log out' clicks. Redirects browser to designated logout URI on confirmation.
     */
    private handleLogoutClick = () => {
        const { dispatch } = this.props;
        /*
        const confirm: ConfirmationModalState = {
            body: 'Are you sure you want to log out?',
            header: 'Log out',
            onClickNo: () => { return; },
            onClickYes: () => { dispatch(logout()); },
            show: true,
            noButtonText: 'No',
            yesButtonText: 'Yes, log me out'
        };
        dispatch(showConfirmationModal(confirm));
        */
    };
}

const mapStateToProps = (state: AppState): StateProps => {
    return { 
        auth: state.auth!,
        user: state.auth.userContext!
    };
};

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps) : DispatchProps => {
    return { 
        dispatch
    };
};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(Header);
