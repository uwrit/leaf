/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { SideNotificationState, NotificationStates } from '../../models/state/GeneralUiState';
import LoaderIcon from '../Other/LoaderIcon/LoaderIcon';
import { FiCheckCircle } from 'react-icons/fi';
import { setSideNotificationState } from '../../actions/generalUi';
import './SideNotification.css';

interface Props {
    dispatch: any;
    state: SideNotificationState;
}

export default class SideNotification extends React.PureComponent<Props> {
    private className = 'side-notification';
    private hideTimeoutOnCompleteMs = 2500;
    
    public componentDidUpdate(prevProps: Props) {
        const currState = this.props.state;
        const { dispatch } = this.props;

        if (currState.state === NotificationStates.Complete) {
            const newState: SideNotificationState = {
                ...currState,
                state: NotificationStates.Hidden
            }

            // Auto-hide after timeout
            setTimeout(() => dispatch(setSideNotificationState(newState)), this.hideTimeoutOnCompleteMs);
        }
    }

    public render() {
        const { state } = this.props;
        const c = this.className;
        const classes = [ c ];

        if (state.state !== NotificationStates.Hidden) { 
            classes.push('show');
        }

        return (
            <div className={classes.join(' ')}>
                <div className={`${c}-container`}>
                    <div className={`${c}-icon-container`}>
                        {state.state === NotificationStates.Working && 
                        <LoaderIcon size={25} />
                        }
                        {state.state === NotificationStates.Complete && 
                        <FiCheckCircle size="2rem" />
                        }
                    </div>
                    <div className={`${c}-text-container`}>
                        <div className={`${c}-text ${c}-text-${NotificationStates[state.state].toLowerCase()}`}>
                            {state.message}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}