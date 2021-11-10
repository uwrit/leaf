/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { NetworkIdentity } from '../../../../models/NetworkResponder';
import NetworkHealthResponder from '../../../Header/NetworkHealthResponder/NetworkHealthResponder';
import { CohortStateType } from '../../../../models/state/CohortState';
import MapPreview from './MapPreview';

interface Props {
    dispatch: any;
    identity: NetworkIdentity;
}

export class IdentityPreview extends React.PureComponent<Props> {
    private className = 'identity-preview';

    public render() {
        const { dispatch, identity } = this.props;
        const c = this.className;

        return (
            <div className={c}>
                <div className={`${c}-left`}>
                    <NetworkHealthResponder 
                        allowDisable={false}
                        dispatch={dispatch}
                        forceUpdate={true}
                        identity={{ ...identity, enabled: true }}
                        queryState={CohortStateType.LOADED}
                        totalActiveResponders={1}
                    />
                </div>
                <div className={`${c}-right`}>
                    <MapPreview identity={identity} />
                </div>
            </div>
        );
    }
};
