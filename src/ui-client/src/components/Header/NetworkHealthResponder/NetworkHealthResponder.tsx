/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { handleResponderToggle } from '../../../actions/networkResponders';
import GlowingButton, { GLOWING_BUTTON_STATE } from '../../Other/GlowingButton/GlowingButton';
import { NetworkIdentity } from '../../../models/NetworkResponder';
import { formatLargeNumber } from '../../../utils/formatNumber';
import { showInfoModal } from '../../../actions/generalUi';
import { InformationModalState } from '../../../models/state/GeneralUiState';
import { CohortStateType } from '../../../models/state/CohortState';
import './NetworkHealthResponder.css';

interface Props {
    allowDisable: boolean;
    queryState: CohortStateType;
    dispatch: any;
    identity: NetworkIdentity;
    totalActiveResponders: number;
}

export default class NetworkHealthResponder extends React.Component<Props> {
    private className = 'header-networkhealth-responder';
    constructor(props: Props) {
        super(props);
    }

    public shouldComponentUpdate(nextProps: Props) {
        if (nextProps.identity.enabled !== this.props.identity.enabled) {
            return true;
        }
        return false;
    }

    public render() {
        const r = this.props.identity;
        const c = this.className;
        const containerClasses = [ `${c}-container` ];
        let status = 'enabled'
        let indicator = GLOWING_BUTTON_STATE.GREEN;

        if (!r.enabled) {
            containerClasses.push('disabled');
            status = 'disabled';
            indicator = GLOWING_BUTTON_STATE.GRAY;
        }

        return (
            <div 
                className={containerClasses.join(' ')}
                onClick={this.handleClick}>
                    <div className={`${c}`}>
                    <div className={`${c}-title`} style={{ borderLeftColor: r.primaryColor }}>
                        <div className={`${c}-title-name`}>
                            {r.name}
                        </div>
                        <div className={`${c}-title-patients`}>
                            {r.totalPatients && `${formatLargeNumber(r.totalPatients)} patients`}
                        </div>
                    </div>
                    {this.props.allowDisable &&
                    <div className={`${c}-enabled`}>
                        <div className={`${c}-enabled-text`}>
                            {status}
                        </div>
                        <div className={`${c}-indicator-container`}>
                            <GlowingButton indicator={indicator} />
                        </div>
                    </div>
                    }
                    <div className={`${c}-text-description`}>
                        {r.description && r.description}
                    </div>
                </div>
            </div>
        )
    }

    private handleClick = () => {
        const { allowDisable, totalActiveResponders, identity, queryState, dispatch } = this.props;
        const info: InformationModalState = {
            body: '',
            header: 'Error',
            show: true
        };

        // Return if we are in single-node mode
        if (!allowDisable) { return; }

        // Error if all nodes would be disabled
        if (totalActiveResponders === 1 && identity.enabled) {
            info.body = 'At least one Leaf server must be enabled in order to run queries.';
            dispatch(showInfoModal(info));
        }

        // Error if a query is currently running
        else if (queryState === CohortStateType.REQUESTING) {
            info.body = 'Leaf servers cannot be enabled/disabled while a query is running.';
            dispatch(showInfoModal(info));
        }

        // Else good to go
        else {
            this.props.dispatch(handleResponderToggle(identity));
        }
    }
}
